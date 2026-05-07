'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const existing = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE email = 'admin@amazon.com' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    if (existing.length > 0) return;

    const hashedPassword = await bcrypt.hash('Admin@1234', 12);
    await queryInterface.bulkInsert('Users', [{
      name: 'Super Admin',
      email: 'admin@amazon.com',
      password: hashedPassword,
      role: 'super_admin',
      sellerStatus: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Users', { email: 'admin@amazon.com' });
  }
};
