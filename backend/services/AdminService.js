const { Product, User, Category, CategoryRequest, Order, OrderItem, ProductVariant, PayoutRequest, SellerLedger, Cart, CartItem, sequelize, Sequelize } = require('../models');
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

    const [products, ledgerBalance, payoutRequests, orderStats] = await Promise.all([
      Product.findAll({
        where: { sellerId },
        include: [{ model: Category, as: 'category' }],
        order: [['createdAt', 'DESC']]
      }),
      SellerLedger.sum('amount', { where: { sellerId, status: 'cleared' } }),
      PayoutRequest.findAll({
        where: { sellerId },
        order: [['createdAt', 'DESC']],
        limit: 10
      }),
      OrderItem.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('OrderItem.id')), 'totalItems'],
          [sequelize.fn('SUM', sequelize.col('OrderItem.priceAtPurchase')), 'totalRevenue'],
        ],
        include: [{
          model: Product,
          as: 'product',
          attributes: [],
          where: { sellerId },
          required: true
        }],
        raw: true
      })
    ]);

    return {
      seller,
      products,
      payoutRequests,
      clearedBalance: parseFloat(ledgerBalance || 0),
      orderStats: orderStats[0] || { totalItems: 0, totalRevenue: 0 }
    };
  }

  // ── Buyers ────────────────────────────────────────────────────────────────

  async getAllBuyers(query = {}) {
    const { page = 1, limit = 20, search } = query;
    const where = { role: 'buyer' };
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const buyers = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']]
    });

    // attach order counts
    const ids = buyers.rows.map(b => b.id);
    const counts = await Order.findAll({
      attributes: ['userId', [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount']],
      where: { userId: ids },
      group: ['userId'],
      raw: true
    });
    const countMap = Object.fromEntries(counts.map(c => [c.userId, parseInt(c.orderCount)]));
    const rows = buyers.rows.map(b => ({ ...b.toJSON(), orderCount: countMap[b.id] || 0 }));

    return { count: buyers.count, rows };
  }

  async getBuyerById(buyerId) {
    const buyer = await User.findOne({
      where: { id: buyerId, role: 'buyer' },
      attributes: { exclude: ['password'] }
    });
    if (!buyer) throw new Error('Buyer not found');

    const [orders, cart] = await Promise.all([
      Order.findAll({
        where: { userId: buyerId },
        include: [{
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'imageUrl', 'price'] }]
        }],
        order: [['createdAt', 'DESC']]
      }),
      Cart.findOne({
        where: { userId: buyerId },
        include: [{
          model: CartItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'imageUrl', 'price'] }]
        }]
      })
    ]);

    return { buyer, orders, cart };
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
    const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'return_pending', 'returned'];
    if (!allowed.includes(status)) throw new Error('Invalid status value');
    
    const t = await sequelize.transaction();
    try {
      const order = await Order.findByPk(orderId, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });
      if (!order) throw new Error('Order not found');

      const items = await OrderItem.findAll({
        where: { orderId: order.id },
        transaction: t
      });

      const oldStatus = order.status;

      // Restore stock if transitioning to cancelled or returned from a non-restored state
      const isRestoring = (status === 'cancelled' || status === 'returned');
      const wasRestored = (oldStatus === 'cancelled' || oldStatus === 'returned');

      if (isRestoring && !wasRestored) {
        for (const item of items) {
          if (item.variantId) {
            const variant = await ProductVariant.findOne({
              where: { id: item.variantId, productId: item.productId },
              transaction: t,
              lock: t.LOCK.UPDATE
            });
            if (variant) {
              await variant.increment('stock', { by: item.quantity, transaction: t });
            }
          } else {
            const product = await Product.findOne({
              where: { id: item.productId },
              transaction: t,
              lock: t.LOCK.UPDATE
            });
            if (product && product.stock !== null) {
              await product.increment('stock', { by: item.quantity, transaction: t });
            }
          }
        }
      }

      await order.update({ status }, { transaction: t });
      await t.commit();
      return order;
    } catch (error) {
      await t.rollback();
      throw error;
    }
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

  // ── Payout Requests ───────────────────────────────────────────────────────

  async getAllPayoutRequests(query = {}) {
    const { status } = query;
    const where = {};
    if (status) where.status = status;

    return await PayoutRequest.findAll({
      where,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email', 'storeName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async approvePayoutRequest(payoutId) {
    const t = await sequelize.transaction();
    try {
      const payout = await PayoutRequest.findByPk(payoutId, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!payout) {
        throw new Error('Payout request not found');
      }

      if (payout.status !== 'pending') {
        throw new Error('Payout request has already been processed');
      }

      // Check current cleared ledger balance
      const clearedResult = await SellerLedger.sum('amount', {
        where: { sellerId: payout.sellerId, status: 'cleared' },
        transaction: t
      });
      const clearedBalance = parseFloat(clearedResult || 0);

      // Verify they have enough balance (payout was already requested, but let's do a final check)
      if (parseFloat(payout.amount) > clearedBalance) {
        throw new Error('Seller does not have sufficient cleared balance to cover this payout');
      }

      // Create negative ledger entry to deduct the amount
      await SellerLedger.create({
        sellerId: payout.sellerId,
        amount: -parseFloat(payout.amount),
        type: 'payout',
        status: 'cleared'
      }, { transaction: t });

      await payout.update({ status: 'approved' }, { transaction: t });

      await t.commit();
      return payout;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async rejectPayoutRequest(payoutId, reason) {
    const t = await sequelize.transaction();
    try {
      const payout = await PayoutRequest.findByPk(payoutId, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!payout) {
        throw new Error('Payout request not found');
      }

      if (payout.status !== 'pending') {
        throw new Error('Payout request has already been processed');
      }

      await payout.update({
        status: 'rejected',
        rejectionReason: reason || 'Rejected by Administrator'
      }, { transaction: t });

      await t.commit();
      return payout;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

module.exports = new AdminService();
