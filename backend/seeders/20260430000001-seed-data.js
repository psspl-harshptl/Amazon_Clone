'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkInsert('Categories', [
        { name: 'Electronics',    slug: 'electronics',  imageUrl: '/images/products/placeholder.png', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Fashion',        slug: 'fashion',      imageUrl: '/images/products/placeholder.png', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Home & Kitchen', slug: 'home-kitchen', imageUrl: '/images/products/placeholder.png', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Books',          slug: 'books',        imageUrl: '/images/products/placeholder.png', createdAt: new Date(), updatedAt: new Date() }
      ], { ignoreDuplicates: true, transaction });

      const [categories] = await queryInterface.sequelize.query(
        `SELECT id, slug FROM "Categories" WHERE slug IN ('electronics', 'fashion')`,
        { transaction }
      );
      const bySlug = Object.fromEntries(categories.map(c => [c.slug, c.id]));

      await queryInterface.bulkInsert('Products', [
        {
          categoryId: bySlug['electronics'],
          name: 'OnePlus 12R (Iron Gray, 8GB RAM, 128GB Storage)',
          slug: 'oneplus-12r-iron-gray',
          description: 'Smooth Beyond Belief. Snapdragon 8 Gen 2, 5500 mAh battery, 100W SUPERVOOC charging.',
          price: 39999.00, mrp: 42999.00, stock: 50,
          imageUrl: '/images/products/placeholder.png',
          images: ['/images/products/placeholder.png'],
          badge: 'Bestseller', rating: 4.5, reviewCount: 1245,
          createdAt: new Date(), updatedAt: new Date()
        },
        {
          categoryId: bySlug['electronics'],
          name: 'Apple iPhone 15 (128 GB) - Blue',
          slug: 'apple-iphone-15-blue',
          description: 'DYNAMIC ISLAND COMES TO IPHONE 15. 48MP MAIN CAMERA WITH 2X TELEPHOTO.',
          price: 72999.00, mrp: 79900.00, stock: 30,
          imageUrl: '/images/products/placeholder.png',
          images: ['/images/products/placeholder.png'],
          badge: "Amazon's Choice", rating: 4.7, reviewCount: 890,
          createdAt: new Date(), updatedAt: new Date()
        },
        {
          categoryId: bySlug['fashion'],
          name: "Men's Regular Fit T-Shirt",
          slug: 'mens-regular-fit-tshirt',
          description: '100% Cotton, Breathable fabric, perfect for summer.',
          price: 499.00, mrp: 999.00, stock: 100,
          imageUrl: '/images/products/cosmetics.png',
          images: ['/images/products/cosmetics.png'],
          badge: 'New Launch', rating: 4.0, reviewCount: 45,
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
        slug: ['oneplus-12r-iron-gray', 'apple-iphone-15-blue', 'mens-regular-fit-tshirt']
      }, { transaction });
      await queryInterface.bulkDelete('Categories', {
        slug: ['electronics', 'fashion', 'home-kitchen', 'books']
      }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
