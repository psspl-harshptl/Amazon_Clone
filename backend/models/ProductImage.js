const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductImage extends Model {
    static associate(models) {
      ProductImage.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    }
  }

  ProductImage.init({
    productId: DataTypes.INTEGER,
    url: DataTypes.STRING,
    isMain: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    sequelize,
    modelName: 'ProductImage',
  });

  return ProductImage;
};
