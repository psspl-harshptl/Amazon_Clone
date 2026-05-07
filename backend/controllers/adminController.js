const AdminService = require('../services/AdminService');

class AdminController {
  async getDashboard(req, res) {
    try {
      const data = await AdminService.getDashboardStats();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Products
  async getAllProducts(req, res) {
    try {
      const data = await AdminService.getAllProducts(req.query);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async approveProduct(req, res) {
    try {
      const product = await AdminService.approveProduct(req.params.id);
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async rejectProduct(req, res) {
    try {
      const product = await AdminService.rejectProduct(req.params.id, req.body.reason);
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateProduct(req, res) {
    try {
      const product = await AdminService.updateProduct(req.params.id, req.body);
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteProduct(req, res) {
    try {
      await AdminService.deleteProduct(req.params.id);
      res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Sellers
  async getAllSellers(req, res) {
    try {
      const data = await AdminService.getAllSellers(req.query);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getSellerById(req, res) {
    try {
      const data = await AdminService.getSellerById(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async approveSeller(req, res) {
    try {
      const seller = await AdminService.approveSeller(req.params.id);
      res.json({ success: true, data: seller });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async rejectSeller(req, res) {
    try {
      const seller = await AdminService.rejectSeller(req.params.id, req.body.reason);
      res.json({ success: true, data: seller });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AdminController();
