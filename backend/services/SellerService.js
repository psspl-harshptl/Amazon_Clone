const { Product, ProductImage, Category } = require('../models');

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
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async createProduct(sellerId, data) {
    const { name, description, price, mrp, stock, categoryId, imageUrl, imageUrls, brand, discount_percent } = data;
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

    return product;
  }

  async updateProduct(sellerId, productId, data) {
    const product = await Product.findOne({ where: { id: productId, sellerId } });
    if (!product) throw new Error('Product not found or access denied');

    const { name, description, price, mrp, stock, categoryId, imageUrl, imageUrls, brand, discount_percent } = data;
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

    return product.reload({ include: [{ model: Category, as: 'category' }] });
  }

  async deleteProduct(sellerId, productId) {
    const product = await Product.findOne({ where: { id: productId, sellerId } });
    if (!product) throw new Error('Product not found or access denied');
    await product.destroy();
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
    return { total, pending, approved, rejected, recent };
  }
}

module.exports = new SellerService();
