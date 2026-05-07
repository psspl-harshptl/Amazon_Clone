'use strict';
const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('Users', {
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
        comment: 'Full display name of the user'
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'Unique email used for login and communication'
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Bcrypt hashed password — never stored plain-text'
      },
      phone: {
        type: DataTypes.STRING(20),
        comment: 'Optional contact phone number'
      },
      address: {
        type: DataTypes.JSONB,
        comment: 'Default shipping address stored as JSON object'
      },
      role: {
        type: DataTypes.ENUM('buyer', 'admin'),
        defaultValue: 'buyer',
        comment: 'Access role — this module only uses buyer'
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

    await queryInterface.addIndex('Users', ['role'], {
      name: 'users_role_idx'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_role";');
  }
};
