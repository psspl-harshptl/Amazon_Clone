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
          name: 'Premium Over-Ear Noise Cancelling Headphones',
          slug: 'premium-over-ear-headphones',
          description: 'High-fidelity audio with advanced noise cancellation.',
          price: 24900.00, mrp: 29999.00, stock: 50,
          imageUrl: '/images/products/headphones.png',
          is_best_seller: true, is_top_deal: false,
          rating: 4.8, reviewCount: 24930,
          createdAt: new Date(), updatedAt: new Date()
        },
        {
          categoryId: electronicsId,
          name: 'Ultra-Thin 14" Laptop 16GB RAM 512GB SSD',
          slug: 'ultra-thin-laptop',
          description: 'Powerful performance in a sleek design.',
          price: 89999.00, mrp: 105000.00, stock: 30,
          imageUrl: '/images/products/laptop.jpg',
          is_best_seller: true, is_top_deal: true, discount_percent: 15,
          rating: 4.6, reviewCount: 12015,
          createdAt: new Date(), updatedAt: new Date()
        },
        {
          categoryId: electronicsId,
          name: 'Mirrorless Digital Camera with 4K Video',
          slug: 'mirrorless-camera',
          description: 'Capture stunning photos and videos.',
          price: 72500.00, mrp: 85000.00, stock: 20,
          imageUrl: '/images/products/camera.jpg',
          is_best_seller: false, is_top_deal: true, discount_percent: 25,
          rating: 4.7, reviewCount: 5620,
          createdAt: new Date(), updatedAt: new Date()
        },
        {
          categoryId: electronicsId,
          name: '27-inch 4K UHD Gaming Monitor 144Hz',
          slug: 'gaming-monitor-4k',
          description: 'Immersive gaming experience with ultra-high resolution.',
          price: 38999.00, mrp: 45000.00, stock: 45,
          imageUrl: '/images/products/monitor.jpg',
          is_best_seller: true, is_top_deal: false,
          rating: 4.5, reviewCount: 3410,
          createdAt: new Date(), updatedAt: new Date()
        },
        {
          categoryId: electronicsId,
          name: 'Professional Tablet with Stylus',
          slug: 'professional-tablet',
          description: 'Perfect for artists and professionals.',
          price: 58500.00, mrp: 65000.00, stock: 60,
          imageUrl: '/images/products/tablet.jpg',
          is_best_seller: false, is_top_deal: true, discount_percent: 10,
          rating: 4.9, reviewCount: 8900,
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
          'premium-over-ear-headphones',
          'ultra-thin-laptop',
          'mirrorless-camera',
          'gaming-monitor-4k',
          'professional-tablet'
        ]
      }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
