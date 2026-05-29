'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reviews', {
      id:        { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      userId:    { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users',    key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      productId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Products', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      orderId:   { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Orders',   key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      rating:    { type: Sequelize.INTEGER, allowNull: false },
      title:     { type: Sequelize.STRING,  allowNull: true },
      comment:   { type: Sequelize.TEXT,    allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.addIndex('Reviews', ['userId', 'productId'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Reviews');
  },
};
