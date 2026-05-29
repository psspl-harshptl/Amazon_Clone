'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('CartItems', 'variantId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'ProductVariants', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('OrderItems', 'variantId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'ProductVariants', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('OrderItems', 'variantLabel', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('CartItems', 'variantId');
    await queryInterface.removeColumn('OrderItems', 'variantId');
    await queryInterface.removeColumn('OrderItems', 'variantLabel');
  },
};
