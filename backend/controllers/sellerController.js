const SellerService = require('../services/SellerService');

class SellerController {
  async getDashboard(req, res) {
    try {
      const stats = await SellerService.getDashboardStats(req.user.id);
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMyProducts(req, res) {
    try {
      const products = await SellerService.getMyProducts(req.user.id);
      res.json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createProduct(req, res) {
    try {
      const product = await SellerService.createProduct(req.user.id, req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateProduct(req, res) {
    try {
      const product = await SellerService.updateProduct(req.user.id, req.params.id, req.body);
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteProduct(req, res) {
    try {
      await SellerService.deleteProduct(req.user.id, req.params.id);
      res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new SellerController();
