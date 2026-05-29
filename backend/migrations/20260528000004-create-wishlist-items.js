'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WishlistItems', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      variantId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'ProductVariants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Unique index for items without variants
    await queryInterface.addIndex('WishlistItems', ['userId', 'productId'], {
      unique: true,
      name: 'wishlist_user_product_unique',
      where: {
        variantId: null,
      },
    });

    // Unique index for items with variants
    await queryInterface.addIndex('WishlistItems', ['userId', 'productId', 'variantId'], {
      unique: true,
      name: 'wishlist_user_product_variant_unique',
      where: {
        variantId: {
          [Sequelize.Op.ne]: null,
        },
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('WishlistItems');
  },
};
