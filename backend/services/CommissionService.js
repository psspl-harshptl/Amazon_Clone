'use strict';
const { CommissionTier } = require('../models');
const { Op } = require('sequelize');

const FALLBACK_RATE = 0.10;

class CommissionService {
  async getRateForPrice(price) {
    const p = parseFloat(price);

    const tier = await CommissionTier.findOne({
      where: {
        minPrice: { [Op.lte]: p },
        [Op.or]: [
          { maxPrice: null },
          { maxPrice: { [Op.gte]: p } }
        ]
      },
      order: [['minPrice', 'DESC']]
    });

    return tier ? parseFloat(tier.rate) : FALLBACK_RATE;
  }

  async getAllTiers() {
    return CommissionTier.findAll({ order: [['minPrice', 'ASC']] });
  }

  async createTier(data) {
    const { label, minPrice, maxPrice, rate } = data;
    if (!label?.trim()) throw new Error('Label is required');
    if (isNaN(parseFloat(minPrice)) || parseFloat(minPrice) < 0) throw new Error('Invalid minPrice');
    if (maxPrice !== null && maxPrice !== undefined && parseFloat(maxPrice) <= parseFloat(minPrice))
      throw new Error('maxPrice must be greater than minPrice');
    if (isNaN(parseFloat(rate)) || parseFloat(rate) <= 0 || parseFloat(rate) >= 1)
      throw new Error('Rate must be between 0 and 1 (e.g. 0.10 for 10%)');
    return CommissionTier.create({ label: label.trim(), minPrice, maxPrice: maxPrice || null, rate });
  }

  async updateTier(id, data) {
    const tier = await CommissionTier.findByPk(id);
    if (!tier) throw new Error('Commission tier not found');
    const { label, minPrice, maxPrice, rate } = data;
    if (maxPrice !== null && maxPrice !== undefined && parseFloat(maxPrice) <= parseFloat(minPrice ?? tier.minPrice))
      throw new Error('maxPrice must be greater than minPrice');
    if (rate !== undefined && (parseFloat(rate) <= 0 || parseFloat(rate) >= 1))
      throw new Error('Rate must be between 0 and 1');
    await tier.update({
      ...(label    !== undefined && { label: label.trim() }),
      ...(minPrice !== undefined && { minPrice }),
      ...(maxPrice !== undefined && { maxPrice: maxPrice || null }),
      ...(rate     !== undefined && { rate }),
    });
    return tier;
  }

  async deleteTier(id) {
    const tier = await CommissionTier.findByPk(id);
    if (!tier) throw new Error('Commission tier not found');
    await tier.destroy();
  }
}

module.exports = new CommissionService();
