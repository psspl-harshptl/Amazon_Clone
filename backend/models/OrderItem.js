'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
      OrderItem.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
      OrderItem.belongsTo(models.ProductVariant, { foreignKey: 'variantId', as: 'variant' });
      OrderItem.hasMany(models.SellerLedger, { foreignKey: 'orderItemId', as: 'ledgerEntries' });
    }
  }
  OrderItem.init({
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    variantId: { type: DataTypes.INTEGER, allowNull: true },
    variantLabel: { type: DataTypes.STRING, allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    priceAtPurchase: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'packed', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false
    },
    carrierName: { type: DataTypes.STRING, allowNull: true },
    trackingNumber: { type: DataTypes.STRING, allowNull: true },
    shippedAt: { type: DataTypes.DATE, allowNull: true },
    deliveredAt: { type: DataTypes.DATE, allowNull: true }
  }, {
    sequelize,
    modelName: 'OrderItem',
  });
  return OrderItem;
};
