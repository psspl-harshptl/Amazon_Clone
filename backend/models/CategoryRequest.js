'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CategoryRequest extends Model {
    static associate(models) {
      CategoryRequest.belongsTo(models.User, { foreignKey: 'sellerId', as: 'seller' });
    }
  }
  CategoryRequest.init({
    name:            { type: DataTypes.STRING, allowNull: false },
    sellerId:        { type: DataTypes.INTEGER, allowNull: false },
    status:          { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
    rejectionReason: { type: DataTypes.TEXT },
  }, {
    sequelize,
    modelName: 'CategoryRequest',
    tableName: 'category_requests',
  });
  return CategoryRequest;
};
