'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CommissionTier extends Model {
    static associate() {}
  }

  CommissionTier.init({
    label:    { type: DataTypes.STRING,        allowNull: false },
    minPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    maxPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    rate:     { type: DataTypes.DECIMAL(5, 4),  allowNull: false },
  }, {
    sequelize,
    modelName: 'CommissionTier',
    tableName: 'CommissionTiers',
  });

  return CommissionTier;
};
