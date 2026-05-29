'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProductVariants', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      size: { type: Sequelize.STRING(20), allowNull: true },
      color: { type: Sequelize.STRING(50), allowNull: true },
      stock: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      sku: { type: Sequelize.STRING(100), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ProductVariants');
  },
};
