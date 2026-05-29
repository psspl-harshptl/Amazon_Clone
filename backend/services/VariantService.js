const { Product, ProductVariant, Category } = require('../models');

const LOW_STOCK_THRESHOLD = 10;

class VariantService {
  async _assertFashionProduct(sellerId, productId) {
    const product = await Product.findOne({
      where: { id: productId, sellerId },
      include: [{ model: Category, as: 'category' }],
    });
    if (!product) throw new Error('Product not found or access denied');
    if (product.category?.slug !== 'fashion') throw new Error('Variants are only supported for Fashion products');
    return product;
  }

  async getVariants(sellerId, productId) {
    await this._assertFashionProduct(sellerId, productId);
    return ProductVariant.findAll({ where: { productId }, order: [['size', 'ASC'], ['color', 'ASC']] });
  }

  async createVariant(sellerId, productId, { size, color, stock = 0, sku }) {
    await this._assertFashionProduct(sellerId, productId);
    if (!size && !color) throw new Error('At least one of size or color is required');
    return ProductVariant.create({ productId, size: size || null, color: color || null, stock, sku: sku || null });
  }

  async updateVariant(sellerId, productId, variantId, { size, color, stock, sku }) {
    await this._assertFashionProduct(sellerId, productId);
    const variant = await ProductVariant.findOne({ where: { id: variantId, productId } });
    if (!variant) throw new Error('Variant not found');
    const updates = {};
    if (size !== undefined) updates.size = size || null;
    if (color !== undefined) updates.color = color || null;
    if (stock !== undefined) updates.stock = Number(stock);
    if (sku !== undefined) updates.sku = sku || null;
    return variant.update(updates);
  }

  async deleteVariant(sellerId, productId, variantId) {
    await this._assertFashionProduct(sellerId, productId);
    const variant = await ProductVariant.findOne({ where: { id: variantId, productId } });
    if (!variant) throw new Error('Variant not found');
    await variant.destroy();
  }

  async bulkReplaceVariants(productId, variants) {
    await ProductVariant.destroy({ where: { productId } });
    if (!variants || variants.length === 0) return [];
    const rows = variants
      .filter(v => v.size || v.color)
      .map(v => ({
        productId,
        size: v.size || null,
        color: v.color || null,
        stock: Number(v.stock) || 0,
        sku: v.sku || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    return ProductVariant.bulkCreate(rows);
  }

  async getLowStockProducts(sellerId) {
    const products = await Product.findAll({
      where: { sellerId },
      include: [
        { model: Category, as: 'category' },
        { model: ProductVariant, as: 'variants' },
      ],
    });

    const alerts = [];
    for (const p of products) {
      if (p.variants && p.variants.length > 0) {
        const lowVariants = p.variants.filter(v => v.stock <= LOW_STOCK_THRESHOLD);
        for (const v of lowVariants) {
          alerts.push({
            productId: p.id,
            productName: p.name,
            variantId: v.id,
            label: [v.size, v.color].filter(Boolean).join(' / '),
            stock: v.stock,
          });
        }
      } else if (p.stock <= LOW_STOCK_THRESHOLD) {
        alerts.push({
          productId: p.id,
          productName: p.name,
          variantId: null,
          label: null,
          stock: p.stock,
        });
      }
    }
    return alerts;
  }
}

module.exports = new VariantService();
