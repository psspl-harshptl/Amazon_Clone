'use strict';
const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        comment: 'Primary key'
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'FK to the buyer who placed the order'
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Sum of (priceAtPurchase × quantity) for all order items'
      },
      status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending',
        comment: 'Current fulfillment state of the order'
      },
      shippingAddress: {
        type: DataTypes.JSONB,
        allowNull: false,
        comment: 'Snapshot of delivery address at time of order'
      },
      paymentMethod: {
        type: DataTypes.ENUM('cod', 'card', 'upi', 'netbanking'),
        allowNull: false,
        comment: 'Payment channel selected at checkout'
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

    await queryInterface.addIndex('Orders', ['userId'], {
      name: 'orders_user_id_idx'
    });
    await queryInterface.addIndex('Orders', ['status'], {
      name: 'orders_status_idx'
    });
    // Composite index for the common query: fetch a user's orders filtered by status
    await queryInterface.addIndex('Orders', ['userId', 'status'], {
      name: 'orders_user_status_idx'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Orders');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Orders_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Orders_paymentMethod";');
  }
};
