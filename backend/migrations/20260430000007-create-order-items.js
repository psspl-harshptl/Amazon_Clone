'use strict';
const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('OrderItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        comment: 'Primary key'
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'FK to the parent Order'
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'FK to the ordered Product'
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Number of units ordered'
      },
      priceAtPurchase: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Product price captured at order time — isolated from future price changes'
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });

    await queryInterface.addIndex('OrderItems', ['orderId'], {
      name: 'order_items_order_id_idx'
    });
    await queryInterface.addIndex('OrderItems', ['productId'], {
      name: 'order_items_product_id_idx'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('OrderItems');
  }
};
