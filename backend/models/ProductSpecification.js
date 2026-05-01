const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductSpecification extends Model {
    static associate(models) {
      ProductSpecification.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    }
  }

  ProductSpecification.init({
    productId: DataTypes.INTEGER,
    key: DataTypes.STRING,
    value: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ProductSpecification',
  });

  return ProductSpecification;
};
