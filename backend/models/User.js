const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Order, { foreignKey: 'userId', as: 'orders' });
      User.hasOne(models.Cart, { foreignKey: 'userId', as: 'cart' });
      User.hasMany(models.Product, { foreignKey: 'sellerId', as: 'listings' });
      User.hasMany(models.Review,  { foreignKey: 'userId',   as: 'reviews' });
      User.hasMany(models.Address, { foreignKey: 'userId', as: 'addresses' });
      User.hasMany(models.WishlistItem, { foreignKey: 'userId', as: 'wishlistItems' });
      User.hasMany(models.SellerLedger, { foreignKey: 'sellerId', as: 'ledgerEntries' });
      User.hasMany(models.PayoutRequest, { foreignKey: 'sellerId', as: 'payoutRequests' });
    }
  }

  User.init({
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM('buyer', 'seller', 'super_admin'),
      defaultValue: 'buyer',
    },
    sellerStatus: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: true,
      defaultValue: null,
    },
    sellerRejectionReason: { type: DataTypes.TEXT, allowNull: true },
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zipCode: DataTypes.STRING,
    country: DataTypes.STRING,
    storeName: { type: DataTypes.STRING, allowNull: true },
    storeLogo: { type: DataTypes.STRING, allowNull: true },
    storeBanner: { type: DataTypes.STRING, allowNull: true },
    storeDescription: { type: DataTypes.TEXT, allowNull: true },
    bankDetails: { type: DataTypes.JSONB, allowNull: true },
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};
