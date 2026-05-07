'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const [rows] = await queryInterface.sequelize.query(
        `SELECT id FROM "Categories" WHERE slug = 'electronics'`,
        { transaction }
      );
      const electronicsId = rows[0].id;

      await queryInterface.bulkInsert('Products', [
        {
          categoryId: electronicsId,
          name: 'Razer BlackShark V2 Pro Wireless Gaming Headset',
          slug: 'razer-blackshark-v2-pro',
          description: 'THX Spatial Audio - 50mm Drivers - Detachable Mic.',
          price: 15999.00, mrp: 19999.00, stock: 100,
          brand: 'Razer',
          imageUrl: '/images/products/headphones.png',
          rating: 4.6, reviewCount: 15200, is_best_seller: true,
          createdAt: new Date(), updatedAt: new Date()
        },
        {
          categoryId: electronicsId,
          name: 'Logitech G502 HERO High Performance Wired Gaming Mouse',
          slug: 'logitech-g502-hero',
          description: 'HERO 25K Sensor, 25,600 DPI, RGB, Adjustable Weights.',
          price: 3995.00, mrp: 5495.00, stock: 300,
          brand: 'Logitech',
          imageUrl: '/images/products/deskmat.png',
          rating: 4.7, reviewCount: 45000, is_best_seller: true,
          createdAt: new Date(), updatedAt: new Date()
        },
        {
          categoryId: electronicsId,
          name: 'Corsair K70 RGB MK.2 Mechanical Gaming Keyboard',
          slug: 'corsair-k70-rgb',
          description: 'CHERRY MX Blue Switches - RGB LED Backlit.',
          price: 12499.00, mrp: 15999.00, stock: 50,
          brand: 'Corsair',
          imageUrl: '/images/products/deskmat.png',
          rating: 4.8, reviewCount: 8900, is_top_deal: true, discount_percent: 22,
          createdAt: new Date(), updatedAt: new Date()
        },
        {
          categoryId: electronicsId,
          name: 'Razer DeathAdder V2 Gaming Mouse',
          slug: 'razer-deathadder-v2',
          description: '20K DPI Optical Sensor - Fastest Gaming Mouse Switch.',
          price: 3499.00, mrp: 5999.00, stock: 200,
          brand: 'Razer',
          imageUrl: '/images/products/deskmat.png',
          rating: 4.5, reviewCount: 22000, is_top_deal: true, discount_percent: 42,
          createdAt: new Date(), updatedAt: new Date()
        },
        {
          categoryId: electronicsId,
          name: 'Logitech G Pro Mechanical Gaming Keyboard',
          slug: 'logitech-g-pro-keyboard',
          description: 'Ultra-portable Tenkeyless Design, Detachable Micro USB Cable.',
          price: 9995.00, mrp: 11995.00, stock: 80,
          brand: 'Logitech',
          imageUrl: '/images/products/deskmat.png',
          rating: 4.7, reviewCount: 12000,
          createdAt: new Date(), updatedAt: new Date()
        }
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
      await queryInterface.bulkDelete('Products', {
        slug: [
          'razer-blackshark-v2-pro',
          'logitech-g502-hero',
          'corsair-k70-rgb',
          'razer-deathadder-v2',
          'logitech-g-pro-keyboard'
        ]
      }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
