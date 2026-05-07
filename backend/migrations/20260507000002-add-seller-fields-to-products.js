'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Products_status" AS ENUM ('pending', 'approved', 'rejected');
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE "Products"
        ADD COLUMN "sellerId"        INTEGER         DEFAULT NULL REFERENCES "Users"(id) ON DELETE SET NULL,
        ADD COLUMN "status"          "enum_Products_status" NOT NULL DEFAULT 'approved',
        ADD COLUMN "rejectionReason" TEXT            DEFAULT NULL,
        ADD COLUMN "viewCount"       INTEGER         NOT NULL DEFAULT 0;
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX "products_seller_id_idx" ON "Products"("sellerId");
    `);
    await queryInterface.sequelize.query(`
      CREATE INDEX "products_status_idx" ON "Products"("status");
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "products_status_idx";
      DROP INDEX IF EXISTS "products_seller_id_idx";
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE "Products"
        DROP COLUMN IF EXISTS "viewCount",
        DROP COLUMN IF EXISTS "rejectionReason",
        DROP COLUMN IF EXISTS "status",
        DROP COLUMN IF EXISTS "sellerId";
    `);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_Products_status";`);
  }
};
