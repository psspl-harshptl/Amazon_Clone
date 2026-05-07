'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
      Product.belongsTo(models.User, { foreignKey: 'sellerId', as: 'seller' });
      Product.hasMany(models.ProductImage, { foreignKey: 'productId', as: 'galleryImages' });
      Product.hasMany(models.ProductSpecification, { foreignKey: 'productId', as: 'specifications' });
      Product.hasMany(models.ProductFeature, { foreignKey: 'productId', as: 'features' });
      Product.hasMany(models.CartItem, { foreignKey: 'productId' });
      Product.hasMany(models.OrderItem, { foreignKey: 'productId' });
    }
  }
  Product.init({
    categoryId: { type: DataTypes.INTEGER, allowNull: false },
    sellerId: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    mrp: DataTypes.DECIMAL(10, 2),
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    imageUrl: DataTypes.STRING,
    badge: DataTypes.STRING,
    rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
    reviewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    brand: DataTypes.STRING,
    is_best_seller: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_top_deal: { type: DataTypes.BOOLEAN, defaultValue: false },
    discount_percent: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'approved',
    },
    rejectionReason: { type: DataTypes.TEXT, allowNull: true },
    viewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};
