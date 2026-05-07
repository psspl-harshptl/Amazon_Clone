const RecentlyViewedService = require('../services/RecentlyViewedService');

class RecentlyViewedController {
  async track(req, res) {
    try {
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ success: false, message: 'productId is required' });
      }
      await RecentlyViewedService.trackView(req.user.id, Number(productId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getHistory(req, res) {
    try {
      const products = await RecentlyViewedService.getHistory(req.user.id);
      res.json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new RecentlyViewedController();
