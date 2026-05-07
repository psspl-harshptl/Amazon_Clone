'use strict';

module.exports = {
  async up(queryInterface) {
    // The role column may already be using enum_Users_role_new from a partial run.
    // Rename it to enum_Users_role if the new name doesn't already exist.
    const [[roleTypeRow]] = await queryInterface.sequelize.query(
      `SELECT typname FROM pg_type WHERE typname = 'enum_Users_role'`
    );
    if (!roleTypeRow) {
      // Rename enum_Users_role_new → enum_Users_role
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_Users_role_new" RENAME TO "enum_Users_role"`
      );
    }

    // Set default if missing
    await queryInterface.sequelize.query(
      `ALTER TABLE "Users" ALTER COLUMN role SET DEFAULT 'buyer'`
    );

    // Add sellerStatus column if not present
    const [[sellerStatusCol]] = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name='Users' AND column_name='sellerStatus'`
    );
    if (!sellerStatusCol) {
      await queryInterface.sequelize.query(
        `CREATE TYPE "enum_Users_sellerStatus" AS ENUM ('pending', 'approved', 'rejected')`
      );
      await queryInterface.sequelize.query(
        `ALTER TABLE "Users" ADD COLUMN "sellerStatus" "enum_Users_sellerStatus" DEFAULT NULL`
      );
    }

    // Add sellerRejectionReason column if not present
    const [[rejectionCol]] = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name='Users' AND column_name='sellerRejectionReason'`
    );
    if (!rejectionCol) {
      await queryInterface.sequelize.query(
        `ALTER TABLE "Users" ADD COLUMN "sellerRejectionReason" TEXT DEFAULT NULL`
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TABLE "Users" DROP COLUMN IF EXISTS "sellerRejectionReason", DROP COLUMN IF EXISTS "sellerStatus"`
    );
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_Users_sellerStatus"`);
  }
};
