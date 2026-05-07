'use strict';
const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('Products', 'brand', {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Manufacturer or brand name used for filtering'
    });

    await queryInterface.addIndex('Products', ['brand'], {
      name: 'products_brand_idx'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('Products', 'products_brand_idx');
    await queryInterface.removeColumn('Products', 'brand');
  }
};
