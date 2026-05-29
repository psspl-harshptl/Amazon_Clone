const { Product, ProductImage, ProductSpecification, ProductVariant, Category, CategoryRequest } = require('../models');
const VariantService = require('./VariantService');
const { Op } = require('sequelize');

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
}

class SellerService {
  async getMyProducts(sellerId) {
    return await Product.findAll({
      where: { sellerId },
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'galleryImages', attributes: ['id', 'url', 'isMain'] },
        { model: ProductSpecification, as: 'specifications', attributes: ['id', 'key', 'value'] },
        { model: ProductVariant, as: 'variants', attributes: ['id', 'size', 'color', 'stock', 'sku'] },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async createProduct(sellerId, data) {
    const { name, description, price, mrp, stock, categoryId, imageUrl, imageUrls, brand, discount_percent, specifications, variants } = data;
    const product = await Product.create({
      sellerId,
      name,
      slug: generateSlug(name),
      description,
      price,
      mrp: mrp || null,
      stock: stock || 0,
      categoryId,
      imageUrl: imageUrl || null,
      brand: brand || null,
      discount_percent: discount_percent || 0,
      status: 'pending',
    });

    if (imageUrls && imageUrls.length > 0) {
      await ProductImage.bulkCreate(
        imageUrls.map((url, i) => ({ productId: product.id, url, isMain: i === 0 }))
      );
    }

    if (specifications && specifications.length > 0) {
      const validSpecs = specifications.filter(s => s.key?.trim() && s.value?.trim());
      if (validSpecs.length > 0) {
        await ProductSpecification.bulkCreate(
          validSpecs.map(s => ({ productId: product.id, key: s.key.trim(), value: s.value.trim() }))
        );
      }
    }

    if (variants && variants.length > 0) {
      await VariantService.bulkReplaceVariants(product.id, variants);
    }

    return product;
  }

  async updateProduct(sellerId, productId, data) {
    const product = await Product.findOne({ where: { id: productId, sellerId } });
    if (!product) throw new Error('Product not found or access denied');

    const { name, description, price, mrp, stock, categoryId, imageUrl, imageUrls, brand, discount_percent, specifications, variants } = data;
    const updates = { description, price, mrp, stock, categoryId, imageUrl, brand, discount_percent };
    if (name && name !== product.name) {
      updates.name = name;
      updates.slug = generateSlug(name);
    }
    await product.update(updates);

    if (imageUrls && imageUrls.length > 0) {
      await ProductImage.destroy({ where: { productId } });
      await ProductImage.bulkCreate(
        imageUrls.map((url, i) => ({ productId, url, isMain: i === 0 }))
      );
    }

    if (specifications !== undefined) {
      await ProductSpecification.destroy({ where: { productId } });
      const validSpecs = (specifications || []).filter(s => s.key?.trim() && s.value?.trim());
      if (validSpecs.length > 0) {
        await ProductSpecification.bulkCreate(
          validSpecs.map(s => ({ productId, key: s.key.trim(), value: s.value.trim() }))
        );
      }
    }

    if (variants !== undefined) {
      await VariantService.bulkReplaceVariants(productId, variants);
    }

    return product.reload({
      include: [
        { model: Category, as: 'category' },
        { model: ProductSpecification, as: 'specifications' },
        { model: ProductVariant, as: 'variants' },
      ],
    });
  }

  async deleteProduct(sellerId, productId) {
    const product = await Product.findOne({ where: { id: productId, sellerId } });
    if (!product) throw new Error('Product not found or access denied');
    await product.destroy();
  }

  async requestCategory(sellerId, name) {
    const trimmed = (name || '').trim();
    if (!trimmed) throw new Error('Category name is required');
    const existing = await Category.findOne({ where: { name: { [Op.iLike]: trimmed } } });
    if (existing) throw new Error('This category already exists — select it from the dropdown');
    const dup = await CategoryRequest.findOne({ where: { name: { [Op.iLike]: trimmed }, status: 'pending' } });
    if (dup) throw new Error('A pending request for this category already exists');
    return CategoryRequest.create({ name: trimmed, sellerId, status: 'pending' });
  }

  async getDashboardStats(sellerId) {
    const [total, pending, approved, rejected] = await Promise.all([
      Product.count({ where: { sellerId } }),
      Product.count({ where: { sellerId, status: 'pending' } }),
      Product.count({ where: { sellerId, status: 'approved' } }),
      Product.count({ where: { sellerId, status: 'rejected' } }),
    ]);
    const recent = await Product.findAll({
      where: { sellerId },
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [{ model: Category, as: 'category' }],
    });
    const lowStockAlerts = await VariantService.getLowStockProducts(sellerId);
    return { total, pending, approved, rejected, recent, lowStockCount: lowStockAlerts.length };
  }
}

module.exports = new SellerService();
