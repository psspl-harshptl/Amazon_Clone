'use strict';
const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        comment: 'Primary key'
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'FK to Categories — product is deleted when category is deleted'
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Full product title as shown on listing and detail pages'
      },
      slug: {
        type: DataTypes.STRING(280),
        allowNull: false,
        comment: 'URL-safe identifier derived from name'
      },
      description: {
        type: DataTypes.TEXT,
        comment: 'Long-form product description'
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Selling price in INR'
      },
      mrp: {
        type: DataTypes.DECIMAL(10, 2),
        comment: 'Maximum retail price — used to display discount percentage'
      },
      stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Available inventory count'
      },
      imageUrl: {
        type: DataTypes.STRING(500),
        comment: 'Primary product image path'
      },
      images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        comment: 'Additional image paths for the gallery carousel'
      },
      badge: {
        type: DataTypes.STRING(50),
        comment: 'Short promotional label shown on the card, e.g. Bestseller'
      },
      rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0,
        comment: 'Aggregate star rating out of 5'
      },
      reviewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Total number of customer reviews'
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });

    await queryInterface.addIndex('Products', ['slug'], {
      unique: true,
      name: 'products_slug_unique'
    });
    await queryInterface.addIndex('Products', ['categoryId'], {
      name: 'products_category_id_idx'
    });
    await queryInterface.addIndex('Products', ['rating'], {
      name: 'products_rating_idx'
    });
    await queryInterface.addIndex('Products', ['price'], {
      name: 'products_price_idx'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Products');
  }
};
