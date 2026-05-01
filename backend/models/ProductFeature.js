const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductFeature extends Model {
    static associate(models) {
      ProductFeature.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    }
  }

  ProductFeature.init({
    productId: DataTypes.INTEGER,
    feature: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'ProductFeature',
  });

  return ProductFeature;
};
