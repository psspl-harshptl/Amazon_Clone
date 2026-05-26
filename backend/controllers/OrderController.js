const { Order, OrderItem, Product, sequelize } = require('../models');

class OrderController {
  async createOrder(req, res) {
    const t = await sequelize.transaction();
    try {
      const { items, totalAmount, shippingAddress, paymentMethod, paymentId } = req.body;
      const userId = req.user.id;

      // Fetch current prices from DB to prevent client-side price tampering
      const productIds = items.map(i => i.productId);
      const dbProducts = await Product.findAll({ where: { id: productIds }, transaction: t });
      const priceMap = Object.fromEntries(dbProducts.map(p => [p.id, parseFloat(p.price)]));

      // Validate all products exist
      for (const item of items) {
        if (priceMap[item.productId] === undefined) {
          throw new Error(`Product ${item.productId} not found`);
        }
      }

      // Recalculate total server-side
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
        status: 'pending'
      }, { transaction: t });

      await Promise.all(items.map(item =>
        OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: priceMap[item.productId]
        }, { transaction: t })
      ));

      await t.commit();

      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      await t.rollback();
      console.error('Create Order Error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
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
            include: [{ model: Product, as: 'product' }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
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
            include: [{ model: Product, as: 'product' }]
          }
        ]
      });

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new OrderController();
