'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RecentlyViewed extends Model {
    static associate(models) {
      RecentlyViewed.belongsTo(models.User, { foreignKey: 'userId' });
      RecentlyViewed.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    }
  }
  RecentlyViewed.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    viewedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'RecentlyViewed',
    tableName: 'recently_vieweds'
  });
  return RecentlyViewed;
};
