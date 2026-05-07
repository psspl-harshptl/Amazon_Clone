'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Explicit USING cast required by PostgreSQL when changing JSONB → VARCHAR
    await queryInterface.sequelize.query(
      'ALTER TABLE "Users" ALTER COLUMN "address" TYPE VARCHAR(255) USING "address"::text'
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "Users" ALTER COLUMN "address" TYPE JSONB USING "address"::jsonb'
    );
  }
};
