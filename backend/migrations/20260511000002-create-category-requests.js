'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('category_requests', {
      id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      name:            { type: Sequelize.STRING, allowNull: false },
      sellerId:        { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      status:          { type: Sequelize.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
      rejectionReason: { type: Sequelize.TEXT, allowNull: true },
      createdAt:       { type: Sequelize.DATE, allowNull: false },
      updatedAt:       { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('category_requests');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_category_requests_status";');
  },
};
