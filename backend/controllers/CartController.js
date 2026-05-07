const CartService = require('../services/CartService');

class CartController {
  async getCart(req, res) {
    try {
      const result = await CartService.getCart(req.user.id);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async addItem(req, res) {
    try {
      const { productId, quantity = 1 } = req.body;
      if (!productId) {
        return res.status(400).json({ success: false, message: 'productId is required' });
      }
      const item = await CartService.addItem(req.user.id, productId, quantity);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      const status = error.message === 'Product not found' ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async updateItem(req, res) {
    try {
      const { quantity } = req.body;
      if (quantity === undefined || quantity === null) {
        return res.status(400).json({ success: false, message: 'quantity is required' });
      }
      const item = await CartService.updateItem(req.user.id, req.params.itemId, quantity);
      res.json({ success: true, data: item });
    } catch (error) {
      const status = error.message === 'Cart item not found' ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async removeItem(req, res) {
    try {
      await CartService.removeItem(req.user.id, req.params.itemId);
      res.json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
      const status = error.message === 'Cart item not found' ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async clearCart(req, res) {
    try {
      await CartService.clearCart(req.user.id);
      res.json({ success: true, message: 'Cart cleared' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CartController();
