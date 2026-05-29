'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CommissionTiers', {
      id:         { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      label:      { type: Sequelize.STRING, allowNull: false },
      minPrice:   { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      maxPrice:   { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      rate:       { type: Sequelize.DECIMAL(5, 4), allowNull: false },
      createdAt:  { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt:  { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    // Seed default tiers
    await queryInterface.bulkInsert('CommissionTiers', [
      { label: 'Budget',   minPrice: 0,    maxPrice: 499.99,  rate: 0.05, createdAt: new Date(), updatedAt: new Date() },
      { label: 'Standard', minPrice: 500,  maxPrice: 4999.99, rate: 0.10, createdAt: new Date(), updatedAt: new Date() },
      { label: 'Premium',  minPrice: 5000, maxPrice: null,    rate: 0.15, createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('CommissionTiers');
  }
};
