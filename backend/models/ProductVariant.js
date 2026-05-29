'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductVariant extends Model {
    static associate(models) {
      ProductVariant.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
      ProductVariant.hasMany(models.WishlistItem, { foreignKey: 'variantId', as: 'wishlistItems' });
    }
  }
  ProductVariant.init({
    productId: { type: DataTypes.INTEGER, allowNull: false },
    size: { type: DataTypes.STRING(20), allowNull: true },
    color: { type: DataTypes.STRING(50), allowNull: true },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    sku: { type: DataTypes.STRING(100), allowNull: true },
  }, {
    sequelize,
    modelName: 'ProductVariant',
  });
  return ProductVariant;
};
