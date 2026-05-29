'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('SellerLedgers', 'rateApplied', {
      type: Sequelize.DECIMAL(5, 4),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('SellerLedgers', 'rateApplied');
  }
};
