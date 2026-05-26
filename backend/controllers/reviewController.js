const ReviewService = require('../services/ReviewService');

class ReviewController {
  async createReview(req, res) {
    try {
      const review = await ReviewService.createReview(req.user.id, req.body);
      res.status(201).json({ success: true, data: review });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async getProductReviews(req, res) {
    try {
      const reviews = await ReviewService.getProductReviews(req.params.productId);
      res.json({ success: true, data: reviews });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async canReview(req, res) {
    try {
      const result = await ReviewService.canReview(req.user?.id, req.params.productId);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new ReviewController();
