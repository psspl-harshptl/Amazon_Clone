'use strict';
const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('recently_vieweds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        comment: 'Primary key'
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
        comment: 'FK to the user who viewed the product'
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Products', key: 'id' },
        onDelete: 'CASCADE',
        comment: 'FK to the viewed Product'
      },
      viewedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Timestamp of last view — upserted on repeated views'
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

    // Prevents duplicate rows; used as the conflict target on upsert
    await queryInterface.addIndex('recently_vieweds', ['userId', 'productId'], {
      unique: true,
      name: 'recently_vieweds_user_product_unique'
    });
    // Supports fetching a user's history ordered by most recently viewed
    await queryInterface.addIndex('recently_vieweds', ['userId', 'viewedAt'], {
      name: 'recently_vieweds_user_viewedat_idx'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('recently_vieweds');
  }
};
