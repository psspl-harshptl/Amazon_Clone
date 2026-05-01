const { Product, Category, ProductImage, ProductSpecification, ProductFeature, Sequelize } = require('../models');
const { Op } = require('sequelize');

class ProductService {
  async getAllProducts(query) {
    const {
      limit = 20,
      page = 1,
      categoryId,
      is_best_seller,
      is_top_deal,
      search,
      brand,
      minPrice,
      maxPrice,
      rating,
      sort
    } = query;

    const offset = (page - 1) * limit;

    const where = {};

    if (categoryId) where.categoryId = categoryId;
    if (is_best_seller === 'true') where.is_best_seller = true;
    if (is_top_deal === 'true') where.is_top_deal = true;

    if (brand) {
      where.brand = { [Op.in]: Array.isArray(brand) ? brand : [brand] };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    if (rating) {
      where.rating = { [Op.gte]: parseFloat(rating) };
    }

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    let order = [['createdAt', 'DESC']];
    if (sort === 'price-low') order = [['price', 'ASC']];
    if (sort === 'price-high') order = [['price', 'DESC']];
    if (sort === 'rating') order = [['rating', 'DESC']];

    return await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{ model: Category, as: 'category' }],
      order
    });
  }

  async getFilters(query) {
    const { categoryId } = query;
    const where = {};
    if (categoryId) where.categoryId = categoryId;

    // Get unique brands
    const brands = await Product.findAll({
      where: { ...where, brand: { [Op.ne]: null } },
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('brand')), 'brand']],
      raw: true
    });

    // Get min/max price
    const priceStats = await Product.findOne({
      where,
      attributes: [
        [Sequelize.fn('MIN', Sequelize.col('price')), 'min'],
        [Sequelize.fn('MAX', Sequelize.col('price')), 'max']
      ],
      raw: true
    });

    return {
      brands: brands.map(b => b.brand),
      priceRange: {
        min: parseFloat(priceStats.min || 0),
        max: parseFloat(priceStats.max || 0)
      }
    };
  }

  async getProductById(id) {
    return await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'galleryImages' },
        { model: ProductSpecification, as: 'specifications' },
        { model: ProductFeature, as: 'features' }
      ]
    });
  }

  async getAllCategories() {
    return await Category.findAll();
  }
}

module.exports = new ProductService();
