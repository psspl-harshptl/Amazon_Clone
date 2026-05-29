const { Order, OrderItem, Product, ProductVariant, sequelize } = require('../models');

function buildVariantLabel(variant) {
  if (!variant) return null;
  const parts = [];
  if (variant.size) parts.push(`Size: ${variant.size}`);
  if (variant.color) parts.push(`Color: ${variant.color}`);
  return parts.join(' / ') || null;
}

class OrderController {
  async createOrder(req, res) {
    const t = await sequelize.transaction();
    try {
      const { items, shippingAddress, paymentMethod, paymentId } = req.body;
      const userId = req.user.id;

      const productIds = items.map(i => i.productId);
      const dbProducts = await Product.findAll({ where: { id: productIds }, transaction: t });
      const priceMap = Object.fromEntries(dbProducts.map(p => [p.id, parseFloat(p.price)]));

      for (const item of items) {
        if (priceMap[item.productId] === undefined) {
          throw new Error(`Product ${item.productId} not found`);
        }
      }

      // Validate and decrement stock for each item
      const variantMap = {};
      for (const item of items) {
        if (item.variantId) {
          const variant = await ProductVariant.findOne({
            where: { id: item.variantId, productId: item.productId },
            transaction: t,
            lock: t.LOCK.UPDATE,
          });
          if (!variant) throw new Error(`Variant ${item.variantId} not found`);
          if (variant.stock < item.quantity) {
            throw new Error(`Insufficient stock for variant ${buildVariantLabel(variant) || item.variantId}`);
          }
          await variant.decrement('stock', { by: item.quantity, transaction: t });
          variantMap[item.variantId] = variant;
        } else {
          const product = dbProducts.find(p => p.id === item.productId);
          if (product.stock !== null && product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product: ${product.name}`);
          }
          if (product.stock !== null) {
            await product.decrement('stock', { by: item.quantity, transaction: t });
          }
        }
      }

      const shipping = 40;
      const itemsTotal = items.reduce((sum, item) => sum + priceMap[item.productId] * item.quantity, 0);
      const tax = Math.round(itemsTotal * 0.18);
      const serverTotal = itemsTotal + shipping + tax;

      const order = await Order.create({
        userId,
        totalAmount: serverTotal,
        shippingAddress,
        paymentMethod,
        paymentId,
        status: 'pending',
      }, { transaction: t });

      await Promise.all(items.map(item =>
        OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          variantId: item.variantId || null,
          variantLabel: item.variantId ? buildVariantLabel(variantMap[item.variantId]) : null,
          quantity: item.quantity,
          priceAtPurchase: priceMap[item.productId],
        }, { transaction: t })
      ));

      await t.commit();
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      await t.rollback();
      console.error('Create Order Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMyOrders(req, res) {
    try {
      const userId = req.user.id;
      const orders = await Order.findAll({
        where: { userId },
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [{ model: Product, as: 'product' }],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
      res.json({ success: true, data: orders });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const order = await Order.findOne({
        where: { id, userId },
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [{ model: Product, as: 'product' }],
          },
        ],
      });

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.json({ success: true, data: order });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async cancelOrder(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const order = await Order.findOne({
        where: { id, userId },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status !== 'pending' && order.status !== 'confirmed') {
        throw new Error(`Cannot cancel order in '${order.status}' status`);
      }

      const items = await OrderItem.findAll({
        where: { orderId: order.id },
        transaction: t
      });

      // Restore stock for items
      for (const item of items) {
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

      await order.update({ status: 'cancelled' }, { transaction: t });
      await t.commit();

      res.json({ success: true, message: 'Order cancelled successfully', data: order });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async requestReturn(req, res) {
    try {
      const { id } = req.params;
      const { returnReason } = req.body;
      const userId = req.user.id;

      if (!returnReason || !returnReason.trim()) {
        return res.status(400).json({ success: false, message: 'Return reason is required' });
      }

      const order = await Order.findOne({
        where: { id, userId },
      });

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (order.status !== 'delivered') {
        return res.status(400).json({ success: false, message: 'Only delivered orders can be returned' });
      }

      // Check if within 7 days of delivery
      const deliveredAt = new Date(order.updatedAt).getTime();
      const now = Date.now();
      const diffDays = (now - deliveredAt) / (1000 * 60 * 60 * 24);

      if (diffDays > 7) {
        return res.status(400).json({ success: false, message: 'Return window (7 days) has expired' });
      }

      await order.update({
        status: 'return_pending',
        returnReason: returnReason.trim(),
      });

      res.json({ success: true, message: 'Return request submitted successfully', data: order });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new OrderController();
