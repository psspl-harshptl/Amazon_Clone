const { Product, User, Category, CategoryRequest, Order, OrderItem, Sequelize } = require('../models');
const { Op } = require('sequelize');

class AdminService {
  // ── Products ──────────────────────────────────────────────────────────────

  async getAllProducts(query = {}) {
    const { status, page = 1, limit = 20, search } = query;
    const where = {};
    if (status) where.status = status;
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    return await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'seller', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async approveProduct(productId) {
    const product = await Product.findByPk(productId);
    if (!product) throw new Error('Product not found');
    await product.update({ status: 'approved', rejectionReason: null });
    return product;
  }

  async rejectProduct(productId, reason) {
    if (!reason || !reason.trim()) throw new Error('Rejection reason is required');
    const product = await Product.findByPk(productId);
    if (!product) throw new Error('Product not found');
    await product.update({ status: 'rejected', rejectionReason: reason.trim() });
    return product;
  }

  async updateProduct(productId, data) {
    const product = await Product.findByPk(productId);
    if (!product) throw new Error('Product not found');
    await product.update(data);
    return product;
  }

  async deleteProduct(productId) {
    const product = await Product.findByPk(productId);
    if (!product) throw new Error('Product not found');
    await product.destroy();
  }

  // ── Sellers ───────────────────────────────────────────────────────────────

  async getAllSellers(query = {}) {
    const { sellerStatus, page = 1, limit = 20 } = query;
    const where = { role: 'seller' };
    if (sellerStatus) where.sellerStatus = sellerStatus;

    return await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']]
    });
  }

  async getSellerById(sellerId) {
    const seller = await User.findOne({
      where: { id: sellerId, role: 'seller' },
      attributes: { exclude: ['password'] }
    });
    if (!seller) throw new Error('Seller not found');

    const products = await Product.findAll({
      where: { sellerId },
      include: [{ model: Category, as: 'category' }],
      order: [['createdAt', 'DESC']]
    });

    return { seller, products };
  }

  async approveSeller(sellerId) {
    const seller = await User.findOne({ where: { id: sellerId, role: 'seller' } });
    if (!seller) throw new Error('Seller not found');
    await seller.update({ sellerStatus: 'approved', sellerRejectionReason: null });
    const json = seller.toJSON();
    delete json.password;
    return json;
  }

  async rejectSeller(sellerId, reason) {
    const seller = await User.findOne({ where: { id: sellerId, role: 'seller' } });
    if (!seller) throw new Error('Seller not found');
    await seller.update({ sellerStatus: 'rejected', sellerRejectionReason: reason || null });
    const json = seller.toJSON();
    delete json.password;
    return json;
  }

  // ── Category Requests ─────────────────────────────────────────────────────

  async getCategoryRequests(query = {}) {
    const where = {};
    if (query.status) where.status = query.status;
    return CategoryRequest.findAll({
      where,
      include: [{ model: User, as: 'seller', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
  }

  async approveCategoryRequest(id) {
    const req = await CategoryRequest.findByPk(id);
    if (!req) throw new Error('Category request not found');
    if (req.status !== 'pending') throw new Error('Request has already been processed');
    const slug = req.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = await Category.create({ name: req.name, slug });
    await req.update({ status: 'approved' });
    return { request: req, category };
  }

  async rejectCategoryRequest(id, reason) {
    const req = await CategoryRequest.findByPk(id);
    if (!req) throw new Error('Category request not found');
    await req.update({ status: 'rejected', rejectionReason: reason || null });
    return req;
  }

  // ── Orders ───────────────────────────────────────────────────────────────

  async getAllOrders(query = {}) {
    const { status, page = 1, limit = 20 } = query;
    const where = {};
    if (status) where.status = status;

    return Order.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      include: [
        { model: User,      as: 'user',  attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'imageUrl'] }] },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async updateOrderStatus(orderId, status) {
    const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) throw new Error('Invalid status value');
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error('Order not found');
    await order.update({ status });
    return order;
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  async getDashboardStats() {
    const [
      totalProducts, pendingProducts, approvedProducts, rejectedProducts,
      totalSellers, pendingSellers, approvedSellers, rejectedSellers,
      topViewed
    ] = await Promise.all([
      Product.count(),
      Product.count({ where: { status: 'pending' } }),
      Product.count({ where: { status: 'approved' } }),
      Product.count({ where: { status: 'rejected' } }),
      User.count({ where: { role: 'seller' } }),
      User.count({ where: { role: 'seller', sellerStatus: 'pending' } }),
      User.count({ where: { role: 'seller', sellerStatus: 'approved' } }),
      User.count({ where: { role: 'seller', sellerStatus: 'rejected' } }),
      Product.findAll({
        order: [['viewCount', 'DESC']],
        limit: 5,
        attributes: ['id', 'name', 'viewCount', 'status', 'imageUrl'],
      }),
    ]);

    return {
      products: { total: totalProducts, pending: pendingProducts, approved: approvedProducts, rejected: rejectedProducts },
      sellers: { total: totalSellers, pending: pendingSellers, approved: approvedSellers, rejected: rejectedSellers },
      topViewed,
    };
  }
}

module.exports = new AdminService();
