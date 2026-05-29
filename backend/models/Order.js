'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items' });
      Order.hasMany(models.Review,    { foreignKey: 'orderId', as: 'reviews' });
    }
  }
  Order.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'return_pending', 'returned'),
      defaultValue: 'pending'
    },
    shippingAddress: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    paymentMethod: DataTypes.STRING,
    paymentId: DataTypes.STRING,
    returnReason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};
