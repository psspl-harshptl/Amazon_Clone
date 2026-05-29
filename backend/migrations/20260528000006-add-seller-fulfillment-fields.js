'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add carrierName column
    await queryInterface.addColumn('OrderItems', 'carrierName', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Add trackingNumber column
    await queryInterface.addColumn('OrderItems', 'trackingNumber', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Add shippedAt column
    await queryInterface.addColumn('OrderItems', 'shippedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Add deliveredAt column
    await queryInterface.addColumn('OrderItems', 'deliveredAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Add status column with ENUM type. We will define an ENUM of: pending, packed, shipped, delivered, cancelled.
    await queryInterface.addColumn('OrderItems', 'status', {
      type: Sequelize.ENUM('pending', 'packed', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('OrderItems', 'carrierName');
    await queryInterface.removeColumn('OrderItems', 'trackingNumber');
    await queryInterface.removeColumn('OrderItems', 'shippedAt');
    await queryInterface.removeColumn('OrderItems', 'deliveredAt');
    await queryInterface.removeColumn('OrderItems', 'status');

    // Clean up PostgreSQL Enum type if applicable
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_OrderItems_status";');
  }
};
