'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SellerLedger extends Model {
    static associate(models) {
      SellerLedger.belongsTo(models.User, { foreignKey: 'sellerId', as: 'seller' });
      SellerLedger.belongsTo(models.OrderItem, { foreignKey: 'orderItemId', as: 'orderItem' });
    }
  }

  SellerLedger.init({
    sellerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    orderItemId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('sale', 'commission', 'payout', 'refund'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'cleared', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false,
    },
    rateApplied: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'SellerLedger',
    tableName: 'SellerLedgers',
  });

  return SellerLedger;
};
