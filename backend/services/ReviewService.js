const { Review, Order, OrderItem, User, sequelize } = require('../models');

class ReviewService {
  async createReview(userId, { productId, orderId, rating, title, comment }) {
    // Verify the order belongs to this user and is delivered
    const order = await Order.findOne({ where: { id: orderId, userId, status: 'delivered' } });
    if (!order) throw new Error('You can only review products from delivered orders');

    // Verify the product was in that order
    const item = await OrderItem.findOne({ where: { orderId, productId } });
    if (!item) throw new Error('This product was not in the specified order');

    // One review per user per product
    const existing = await Review.findOne({ where: { userId, productId } });
    if (existing) throw new Error('You have already reviewed this product');

    const review = await Review.create({ userId, productId, orderId, rating, title: title?.trim() || null, comment: comment.trim() });

    // Recalculate product aggregate rating
    await this._updateProductRating(productId);

    return review.reload({ include: [{ model: User, as: 'user', attributes: ['id', 'name'] }] });
  }

  async getProductReviews(productId) {
    return Review.findAll({
      where: { productId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
  }

  // Check if the logged-in user can review this product
  async canReview(userId, productId) {
    if (!userId) return { canReview: false };

    const existing = await Review.findOne({ where: { userId, productId } });
    if (existing) return { canReview: false, alreadyReviewed: true, review: existing };

    // Find a delivered order that contains this product
    const item = await OrderItem.findOne({
      where: { productId },
      include: [{ model: Order, as: 'order', where: { userId, status: 'delivered' }, required: true }],
    });

    if (!item) return { canReview: false };
    return { canReview: true, orderId: item.orderId };
  }

  async _updateProductRating(productId) {
    const { Product } = require('../models');
    const [result] = await sequelize.query(
      `SELECT AVG(rating)::numeric(3,2) AS avg, COUNT(*) AS cnt FROM "Reviews" WHERE "productId" = :productId`,
      { replacements: { productId }, type: sequelize.QueryTypes.SELECT }
    );
    await Product.update(
      { rating: parseFloat(result.avg) || 0, reviewCount: parseInt(result.cnt) || 0 },
      { where: { id: productId } }
    );
  }
}

module.exports = new ReviewService();
