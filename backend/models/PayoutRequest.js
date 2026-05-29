'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PayoutRequest extends Model {
    static associate(models) {
      PayoutRequest.belongsTo(models.User, { foreignKey: 'sellerId', as: 'seller' });
    }
  }

  PayoutRequest.init({
    sellerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    },
    bankDetails: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'PayoutRequest',
    tableName: 'PayoutRequests',
  });

  return PayoutRequest;
};
