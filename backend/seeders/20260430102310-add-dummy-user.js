'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const hashedPassword = await bcrypt.hash('password123', 12);

      await queryInterface.bulkDelete('Users', { email: 'harsh@example.com' }, { transaction });
      await queryInterface.bulkInsert('Users', [{
        name: 'Harsh Patel',
        email: 'harsh@example.com',
        password: hashedPassword,
        role: 'buyer',
        createdAt: new Date(),
        updatedAt: new Date()
      }], { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('Users', { email: 'harsh@example.com' }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
