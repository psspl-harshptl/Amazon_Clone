const { Order, OrderItem, Product } = require('../models');

class OrderController {
  async createOrder(req, res) {
    try {
      const { items, totalAmount, shippingAddress, paymentMethod, paymentId } = req.body;
      const userId = req.user.id;

      // Create main order
      const order = await Order.create({
        userId,
        totalAmount,
        shippingAddress,
        paymentMethod,
        paymentId,
        status: 'confirmed' // Since payment is already done in frontend simulation/real modal
      });

      // Create order items
      const orderItems = await Promise.all(items.map(async (item) => {
        return await OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.price
        });
      }));

      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
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
