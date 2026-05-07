'use strict';
const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const tableInfo = await queryInterface.describeTable('Users');

    if (!tableInfo.address) {
      await queryInterface.addColumn('Users', 'address', {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Street address line'
      });
    }
    if (!tableInfo.city) {
      await queryInterface.addColumn('Users', 'city', {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'City for shipping'
      });
    }
    if (!tableInfo.state) {
      await queryInterface.addColumn('Users', 'state', {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'State or province for shipping'
      });
    }
    if (!tableInfo.zipCode) {
      await queryInterface.addColumn('Users', 'zipCode', {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Postal/ZIP code'
      });
    }
    if (!tableInfo.country) {
      await queryInterface.addColumn('Users', 'country', {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Country for shipping'
      });
    }
    if (!tableInfo.phone) {
      await queryInterface.addColumn('Users', 'phone', {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Contact phone number'
      });
    }
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable('Users');

    if (tableInfo.address) await queryInterface.removeColumn('Users', 'address');
    if (tableInfo.city)    await queryInterface.removeColumn('Users', 'city');
    if (tableInfo.state)   await queryInterface.removeColumn('Users', 'state');
    if (tableInfo.zipCode) await queryInterface.removeColumn('Users', 'zipCode');
    if (tableInfo.country) await queryInterface.removeColumn('Users', 'country');
    if (tableInfo.phone)   await queryInterface.removeColumn('Users', 'phone');
  }
};
