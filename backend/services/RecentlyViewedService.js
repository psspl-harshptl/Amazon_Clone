const { RecentlyViewed, Product } = require('../models');

class RecentlyViewedService {
  async trackView(userId, productId) {
    const existing = await RecentlyViewed.findOne({ where: { userId, productId } });
    if (existing) {
      await existing.update({ viewedAt: new Date() });
    } else {
      await RecentlyViewed.create({ userId, productId, viewedAt: new Date() });
      // Keep at most 20 entries per user
      const rows = await RecentlyViewed.findAll({
        where: { userId },
        order: [['viewedAt', 'DESC']],
        attributes: ['id']
      });
      if (rows.length > 20) {
        const idsToDelete = rows.slice(20).map(r => r.id);
        await RecentlyViewed.destroy({ where: { id: idsToDelete } });
      }
    }
  }

  async getHistory(userId, limit = 20) {
    const records = await RecentlyViewed.findAll({
      where: { userId },
      order: [['viewedAt', 'DESC']],
      limit,
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'imageUrl', 'rating', 'reviewCount', 'discount_percent']
      }]
    });
    return records.map(r => r.product).filter(Boolean);
  }
}

module.exports = new RecentlyViewedService();
