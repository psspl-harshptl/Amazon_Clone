'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    static associate(models) {
      Address.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  Address.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    streetAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true },
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'India',
      validate: { notEmpty: true },
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'Address',
    tableName: 'Addresses',
  });
  return Address;
};
