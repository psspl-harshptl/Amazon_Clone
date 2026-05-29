'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WishlistItem extends Model {
    static associate(models) {
      WishlistItem.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      WishlistItem.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
      WishlistItem.belongsTo(models.ProductVariant, { foreignKey: 'variantId', as: 'variant' });
    }
  }
  WishlistItem.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    variantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'WishlistItem',
    tableName: 'WishlistItems',
  });
  return WishlistItem;
};
