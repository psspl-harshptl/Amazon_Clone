'use strict';
const { Order, OrderItem, Product, ProductVariant, User, SellerLedger, sequelize } = require('../models');
const CommissionService = require('../services/CommissionService');

async function syncParentOrderStatus(orderId, transaction) {
  const items = await OrderItem.findAll({ where: { orderId }, transaction });
  if (items.length === 0) return;

  const nonCancelled = items.filter(item => item.status !== 'cancelled');

  let newStatus = 'pending';

  if (nonCancelled.length === 0) {
    newStatus = 'cancelled';
  } else if (nonCancelled.every(item => item.status === 'delivered')) {
    newStatus = 'delivered';
  } else if (nonCancelled.every(item => item.status === 'shipped' || item.status === 'delivered')) {
    newStatus = 'shipped';
  } else if (nonCancelled.every(item => ['packed', 'shipped', 'delivered'].includes(item.status))) {
    newStatus = 'confirmed';
  } else {
    newStatus = 'pending';
  }

  const order = await Order.findByPk(orderId, { transaction });
  if (order && order.status !== newStatus) {
    await order.update({ status: newStatus }, { transaction });
  }
}

class SellerOrderController {
  async getMyOrders(req, res) {
    try {
      const sellerId = req.user.id;
      const items = await OrderItem.findAll({
        include: [
          {
            model: Product,
            as: 'product',
            where: { sellerId },
            attributes: ['id', 'name', 'imageUrl', 'price']
          },
          {
            model: Order,
            as: 'order',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
              }
            ]
          },
          {
            model: ProductVariant,
            as: 'variant',
            attributes: ['id', 'size', 'color', 'stock', 'sku']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({ success: true, data: items });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateFulfillmentStatus(req, res) {
    const t = await sequelize.transaction();
    try {
      const sellerId = req.user.id;
      const { itemId } = req.params;
      const { status, carrierName, trackingNumber } = req.body;

      const validStatuses = ['packed', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}. Must be one of packed, shipped, delivered, or cancelled.`);
      }

      // Find the item and lock it
      const item = await OrderItem.findOne({
        where: { id: itemId },
        include: [{ model: Product, as: 'product', where: { sellerId } }],
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!item) {
        return res.status(404).json({ success: false, message: 'Order item not found or access denied' });
      }

      if (item.status === 'cancelled') {
        throw new Error('Cannot update status of a cancelled item');
      }

      if (item.status === 'delivered') {
        throw new Error('Cannot update status of an already delivered item');
      }

      const updates = { status };

      if (status === 'shipped') {
        if (!carrierName || !trackingNumber) {
          throw new Error('Carrier name and tracking number are required to mark item as shipped');
        }

        const cleanCarrier = String(carrierName).trim();
        const cleanTracking = String(trackingNumber).trim();

        if (cleanCarrier.length < 2 || cleanCarrier.length > 50 || !/^[a-zA-Z0-9\s\.\-]+$/.test(cleanCarrier)) {
          throw new Error('Carrier name must be between 2 and 50 characters and can only contain alphanumeric characters, spaces, dots, or hyphens.');
        }

        if (cleanTracking.length < 5 || cleanTracking.length > 30 || !/^[a-zA-Z0-9]+$/.test(cleanTracking)) {
          throw new Error('Tracking number must be alphanumeric (letters and numbers only) and between 5 and 30 characters.');
        }

        updates.carrierName = cleanCarrier;
        updates.trackingNumber = cleanTracking;
        updates.shippedAt = new Date();
      }

      if (status === 'delivered') {
        updates.deliveredAt = new Date();

        // Check if ledger already has entry for this item to avoid double-crediting
        const existingLedger = await SellerLedger.findOne({
          where: { orderItemId: item.id },
          transaction: t
        });

        if (!existingLedger) {
          const itemTotal = parseFloat(item.priceAtPurchase) * item.quantity;
          const rate = await CommissionService.getRateForPrice(item.priceAtPurchase);
          const commissionAmount = parseFloat((itemTotal * rate).toFixed(2));

          // Credit Sale
          await SellerLedger.create({
            sellerId,
            orderItemId: item.id,
            amount: itemTotal,
            type: 'sale',
            status: 'cleared',
            rateApplied: rate
          }, { transaction: t });

          // Debit Commission
          await SellerLedger.create({
            sellerId,
            orderItemId: item.id,
            amount: -commissionAmount,
            type: 'commission',
            status: 'cleared',
            rateApplied: rate
          }, { transaction: t });
        }
      }

      if (status === 'cancelled') {
        // Restore stock
        if (item.variantId) {
          const variant = await ProductVariant.findOne({
            where: { id: item.variantId, productId: item.productId },
            transaction: t,
            lock: t.LOCK.UPDATE
          });
          if (variant) {
            await variant.increment('stock', { by: item.quantity, transaction: t });
          }
        } else {
          const product = await Product.findOne({
            where: { id: item.productId },
            transaction: t,
            lock: t.LOCK.UPDATE
          });
          if (product && product.stock !== null) {
            await product.increment('stock', { by: item.quantity, transaction: t });
          }
        }
      }

      await item.update(updates, { transaction: t });
      await syncParentOrderStatus(item.orderId, t);

      await t.commit();

      // Return updated item (reload associations)
      const updatedItem = await OrderItem.findByPk(itemId, {
        include: [
          { model: Product, as: 'product' },
          { model: ProductVariant, as: 'variant' }
        ]
      });

      res.json({ success: true, data: updatedItem });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async printPackingSlip(req, res) {
    try {
      const sellerId = req.user.id;
      const { itemId } = req.params;

      const item = await OrderItem.findOne({
        where: { id: itemId },
        include: [
          { model: Product, as: 'product', where: { sellerId } },
          { model: Order, as: 'order', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
          { model: ProductVariant, as: 'variant' }
        ]
      });

      if (!item) {
        return res.status(404).send('<h1>Packing Slip Not Found</h1><p>You do not have access to this order item.</p>');
      }

      const shipping = item.order.shippingAddress;
      const formattedAddress = `
        <strong>Name:</strong> ${shipping.name || item.order.user.name}<br/>
        <strong>Address:</strong> ${shipping.addressLine1 || shipping.address || ''}<br/>
        ${shipping.addressLine2 ? `<strong>Address 2:</strong> ${shipping.addressLine2}<br/>` : ''}
        <strong>City:</strong> ${shipping.city || ''}, <strong>State:</strong> ${shipping.state || ''} - ${shipping.zipCode || shipping.postalCode || ''}<br/>
        <strong>Country:</strong> ${shipping.country || ''}<br/>
        <strong>Phone:</strong> ${shipping.phone || ''}
      `;

      const slipHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Packing Slip - Order #${item.order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; line-height: 1.5; }
            .header { border-bottom: 2px solid #ddd; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #FF9900; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; }
            .grid { display: flex; justify-content: space-between; }
            .col { flex: 1; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f8f8; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align: right;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #FF9900; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Print packing slip</button>
          </div>
          <div class="header">
            <div class="grid">
              <div>
                <h1>Amazon Clone</h1>
                <p>Merchant Packing Slip</p>
              </div>
              <div style="text-align: right;">
                <h3>Order #${item.order.id}</h3>
                <p>Date: ${new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div class="grid section">
            <div class="col">
              <div class="section-title">Shipping Address</div>
              <p>${formattedAddress}</p>
            </div>
            <div class="col" style="margin-left: 40px;">
              <div class="section-title">Order Info</div>
              <p>
                <strong>Buyer:</strong> ${item.order.user.name} (${item.order.user.email})<br/>
                <strong>Payment Method:</strong> ${item.order.paymentMethod || 'Credit/Debit Card'}<br/>
                <strong>Item Status:</strong> ${item.status.toUpperCase()}<br/>
                ${item.carrierName ? `<strong>Carrier:</strong> ${item.carrierName}<br/>` : ''}
                ${item.trackingNumber ? `<strong>Tracking #:</strong> ${item.trackingNumber}<br/>` : ''}
              </p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Item Details</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU / Details</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>${item.product.name}</strong>
                    ${item.variantLabel ? `<br/><span style="color:#666; font-size:13px;">${item.variantLabel}</span>` : ''}
                  </td>
                  <td>${item.variant?.sku || `PROD-${item.product.id}`}</td>
                  <td>${item.quantity}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p>This is an automated packing slip generated on behalf of the merchant.</p>
          </div>
        </body>
        </html>
      `;
      res.send(slipHtml);
    } catch (error) {
      res.status(500).send(`<h1>Error generating packing slip</h1><p>${error.message}</p>`);
    }
  }
}

module.exports = new SellerOrderController();
