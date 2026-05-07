'use strict';
const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('Orders', 'paymentId', {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'External payment gateway transaction ID for reconciliation'
    });

    await queryInterface.addIndex('Orders', ['paymentId'], {
      name: 'orders_payment_id_idx'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('Orders', 'orders_payment_id_idx');
    await queryInterface.removeColumn('Orders', 'paymentId');
  }
};
