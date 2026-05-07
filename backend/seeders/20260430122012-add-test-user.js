'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const hashedPassword = await bcrypt.hash('password123', 12);

      await queryInterface.bulkInsert('Users', [{
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'buyer',
        createdAt: new Date(),
        updatedAt: new Date()
      }], { ignoreDuplicates: true, transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('Users', { email: 'test@example.com' }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
