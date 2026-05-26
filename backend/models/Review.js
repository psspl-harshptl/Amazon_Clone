'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.User,    { foreignKey: 'userId',    as: 'user' });
      Review.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
      Review.belongsTo(models.Order,   { foreignKey: 'orderId',   as: 'order' });
    }
  }

  Review.init({
    userId:    { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    orderId:   { type: DataTypes.INTEGER, allowNull: false },
    rating:    { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    title:     { type: DataTypes.STRING,  allowNull: true },
    comment:   { type: DataTypes.TEXT,    allowNull: false },
  }, {
    sequelize,
    modelName: 'Review',
    indexes: [{ unique: true, fields: ['userId', 'productId'] }],
  });

  return Review;
};
