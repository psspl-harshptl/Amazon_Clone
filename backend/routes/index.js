const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const userRoutes = require('./user.routes');
const recentlyViewedRoutes = require('./recentlyViewed.routes');
const sellerRoutes = require('./seller.routes');
const adminRoutes = require('./admin.routes');
const uploadRoutes = require('./upload.routes');

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/recently-viewed', recentlyViewedRoutes);
router.use('/seller', sellerRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;
