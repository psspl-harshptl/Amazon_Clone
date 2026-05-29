'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create SellerLedgers Table
    await queryInterface.createTable('SellerLedgers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      sellerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      orderItemId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'OrderItems',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('sale', 'commission', 'payout', 'refund'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'cleared', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Create PayoutRequests Table
    await queryInterface.createTable('PayoutRequests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      sellerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      bankDetails: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PayoutRequests');
    await queryInterface.dropTable('SellerLedgers');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_SellerLedgers_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_SellerLedgers_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_PayoutRequests_status";');
  }
};
