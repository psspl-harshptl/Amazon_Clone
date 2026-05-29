'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add returnReason to Orders
    await queryInterface.addColumn('Orders', 'returnReason', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Reason provided by buyer for returning the order',
    });

    // Alter PostgreSQL enum type for Orders status
    // Since PostgreSQL doesn't allow ALTER TYPE inside a transaction block in older versions, 
    // but in newer ones it does depending on configuration, we wrap it safely.
    await queryInterface.sequelize.query('ALTER TYPE "enum_Orders_status" ADD VALUE IF NOT EXISTS \'return_pending\';');
    await queryInterface.sequelize.query('ALTER TYPE "enum_Orders_status" ADD VALUE IF NOT EXISTS \'returned\';');
  },

  async down(queryInterface, Sequelize) {
    // Remove column
    await queryInterface.removeColumn('Orders', 'returnReason');
    
    // Note: PostgreSQL does not support removing values from an ENUM type easily.
    // Down migration doesn't strictly need to drop the enum values as they don't break anything.
  },
};
