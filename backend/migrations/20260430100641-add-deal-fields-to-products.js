'use strict';
const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('Products', 'is_best_seller', {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Marks product for display in the Bestsellers section'
    });
    await queryInterface.addColumn('Products', 'is_top_deal', {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Marks product for display in the Top Deals section'
    });
    await queryInterface.addColumn('Products', 'discount_percent', {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Precomputed discount percentage derived from (mrp - price) / mrp'
    });

    await queryInterface.addIndex('Products', ['is_best_seller'], {
      name: 'products_is_best_seller_idx'
    });
    await queryInterface.addIndex('Products', ['is_top_deal'], {
      name: 'products_is_top_deal_idx'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('Products', 'products_is_best_seller_idx');
    await queryInterface.removeIndex('Products', 'products_is_top_deal_idx');
    await queryInterface.removeColumn('Products', 'is_best_seller');
    await queryInterface.removeColumn('Products', 'is_top_deal');
    await queryInterface.removeColumn('Products', 'discount_percent');
  }
};
