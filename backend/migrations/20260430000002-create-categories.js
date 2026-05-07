'use strict';
const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('Categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        comment: 'Primary key'
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Human-readable category name, must be unique'
      },
      slug: {
        type: DataTypes.STRING(120),
        allowNull: false,
        comment: 'URL-safe identifier used in routes and filters'
      },
      imageUrl: {
        type: DataTypes.STRING(500),
        comment: 'Cover image path for the category banner'
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

    await queryInterface.addIndex('Categories', ['slug'], {
      unique: true,
      name: 'categories_slug_unique'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Categories');
  }
};
