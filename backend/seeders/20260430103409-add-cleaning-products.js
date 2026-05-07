'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Queried by slug — categoryId: 2 was a bug (slug 'home-kitchen' is id 3 after seed-data runs)
      const [rows] = await queryInterface.sequelize.query(
        `SELECT id FROM "Categories" WHERE slug = 'home-kitchen'`,
        { transaction }
      );
      const homeKitchenId = rows[0].id;

      await queryInterface.bulkInsert('Products', [
        {
          categoryId: homeKitchenId,
          name: 'Scotch-Brite Scrub Pad (pack of 5)',
          slug: 'scotch-brite-scrub-pad-5',
          description: 'Efficient cleaning with heavy-duty scrub pads.',
          price: 75.00, mrp: 100.00, stock: 500,
          brand: 'Scotch-Brite',
          imageUrl: '/images/products/cosmetics.png',
          rating: 4.4, reviewCount: 10500, is_best_seller: true,
          createdAt: new Date(), updatedAt: new Date()
        },
        {
          categoryId: homeKitchenId,
          name: 'Gala 132739 Brushtile Soft Cloth Brush (Pack of 1 piece)',
          slug: 'gala-soft-brush',
          description: 'Soft bristles for gentle yet effective cleaning.',
          price: 109.00, mrp: 120.00, stock: 200,
          brand: 'Gala',
          imageUrl: '/images/products/cosmetics.png',
          rating: 4.3, reviewCount: 1100, is_top_deal: true, discount_percent: 9,
          createdAt: new Date(), updatedAt: new Date()
        },
        {
          categoryId: homeKitchenId,
          name: 'Gala Steel Scrubber Combo Set (Pack of 6)',
          slug: 'gala-steel-scrubber-6',
          description: 'Durable steel scrubbers for tough stains.',
          price: 120.00, mrp: 240.00, stock: 350,
          brand: 'Gala',
          imageUrl: '/images/products/cosmetics.png',
          rating: 4.3, reviewCount: 2700, is_top_deal: true, discount_percent: 50,
          createdAt: new Date(), updatedAt: new Date()
        },
        {
          categoryId: homeKitchenId,
          name: 'Cello Kleeno Dual Action Sink & Dish Brush',
          slug: 'cello-kleeno-brush',
          description: 'Dual action bristles for versatile cleaning.',
          price: 169.00, mrp: 180.00, stock: 150,
          brand: 'Cello',
          imageUrl: '/images/products/cosmetics.png',
          rating: 4.3, reviewCount: 4500,
          createdAt: new Date(), updatedAt: new Date()
        },
        {
          categoryId: homeKitchenId,
          name: 'Scotch-Brite Lemon Scented Kitchen Gloves',
          slug: 'scotch-brite-gloves',
          description: 'Protection and scent for your kitchen tasks.',
          price: 130.00, mrp: 150.00, stock: 120,
          brand: 'Scotch-Brite',
          imageUrl: '/images/products/cosmetics.png',
          rating: 4.1, reviewCount: 2400,
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
          'scotch-brite-scrub-pad-5',
          'gala-soft-brush',
          'gala-steel-scrubber-6',
          'cello-kleeno-brush',
          'scotch-brite-gloves'
        ]
      }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
