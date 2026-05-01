const ProductService = require('../services/ProductService');

class ProductController {
  async getAllProducts(req, res) {
    try {
      const data = await ProductService.getAllProducts(req.query);
      res.json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getFilters(req, res) {
    try {
      const filters = await ProductService.getFilters(req.query);
      res.json({ success: true, data: filters });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getProductById(req, res) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllCategories(req, res) {
    try {
      const categories = await ProductService.getAllCategories();
      res.json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ProductController();
