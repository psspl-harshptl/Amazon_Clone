'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const [rows] = await queryInterface.sequelize.query(
        `SELECT id FROM "Products" WHERE slug = 'razer-blackshark-v2-pro'`,
        { transaction }
      );
      const productId = rows[0].id;

      await queryInterface.bulkInsert('ProductImages', [
        { productId, url: '/images/products/headphones.png', isMain: true,  createdAt: new Date(), updatedAt: new Date() },
        { productId, url: '/images/products/deskmat.png',    isMain: false, createdAt: new Date(), updatedAt: new Date() }
      ], { transaction });

      await queryInterface.bulkInsert('ProductSpecifications', [
        { productId, key: 'Brand',        value: 'Razer',         createdAt: new Date(), updatedAt: new Date() },
        { productId, key: 'Color',        value: 'Classic Black', createdAt: new Date(), updatedAt: new Date() },
        { productId, key: 'Connectivity', value: 'Wireless',      createdAt: new Date(), updatedAt: new Date() },
        { productId, key: 'Form Factor',  value: 'Over Ear',      createdAt: new Date(), updatedAt: new Date() }
      ], { transaction });

      await queryInterface.bulkInsert('ProductFeatures', [
        { productId, feature: 'The #1 Best-Selling Gaming Peripherals Manufacturer in the US.',    createdAt: new Date(), updatedAt: new Date() },
        { productId, feature: 'Triforce Titanium 50mm High-End Sound Drivers.',                   createdAt: new Date(), updatedAt: new Date() },
        { productId, feature: 'HyperClear Supercardioid Mic for ultra-clear voice quality.',      createdAt: new Date(), updatedAt: new Date() }
      ], { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const [rows] = await queryInterface.sequelize.query(
        `SELECT id FROM "Products" WHERE slug = 'razer-blackshark-v2-pro'`,
        { transaction }
      );
      const productId = rows[0]?.id;

      if (productId) {
        await queryInterface.bulkDelete('ProductFeatures',      { productId }, { transaction });
        await queryInterface.bulkDelete('ProductSpecifications', { productId }, { transaction });
        await queryInterface.bulkDelete('ProductImages',         { productId }, { transaction });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
