'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkInsert('Categories', [
        { name: 'Pet Supplies', slug: 'pet-supplies', imageUrl: '/images/products/placeholder.png', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Automotive',   slug: 'automotive',   imageUrl: '/images/products/placeholder.png', createdAt: new Date(), updatedAt: new Date() }
      ], { ignoreDuplicates: true, transaction });

      const [rows] = await queryInterface.sequelize.query(
        `SELECT id FROM "Categories" WHERE slug = 'pet-supplies'`,
        { transaction }
      );
      const petId = rows[0].id;

      await queryInterface.bulkInsert('Products', [
        {
          categoryId: petId,
          name: 'Pedigree Adult Dry Dog Food - Chicken & Vegetables',
          slug: 'pedigree-adult-dry-dog-food',
          description: 'Complete and balanced dog food. Contains 20% protein, 10% fat and 5% fiber.',
          price: 1250.00, mrp: 1400.00, stock: 200,
          imageUrl: '/images/products/placeholder.png',
          images: ['/images/products/placeholder.png'],
          badge: 'Bestseller', rating: 4.8, reviewCount: 3421,
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
      await queryInterface.bulkDelete('Products', { slug: 'pedigree-adult-dry-dog-food' }, { transaction });
      await queryInterface.bulkDelete('Categories', { slug: ['pet-supplies', 'automotive'] }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
