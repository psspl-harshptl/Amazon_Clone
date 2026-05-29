const VariantService = require('../services/VariantService');

class VariantController {
  async getVariants(req, res) {
    try {
      const variants = await VariantService.getVariants(req.user.id, req.params.productId);
      res.json({ success: true, data: variants });
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async createVariant(req, res) {
    try {
      const variant = await VariantService.createVariant(req.user.id, req.params.productId, req.body);
      res.status(201).json({ success: true, data: variant });
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async updateVariant(req, res) {
    try {
      const variant = await VariantService.updateVariant(
        req.user.id,
        req.params.productId,
        req.params.variantId,
        req.body,
      );
      res.json({ success: true, data: variant });
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async deleteVariant(req, res) {
    try {
      await VariantService.deleteVariant(req.user.id, req.params.productId, req.params.variantId);
      res.json({ success: true, message: 'Variant deleted' });
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async getLowStock(req, res) {
    try {
      const alerts = await VariantService.getLowStockProducts(req.user.id);
      res.json({ success: true, data: alerts });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new VariantController();
