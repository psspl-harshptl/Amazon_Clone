const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const adminController = require('../controllers/adminController');
const commissionController = require('../controllers/commissionController');

router.use(authMiddleware, requireRole('super_admin'));

router.get('/dashboard',                  adminController.getDashboard);

router.get('/products',                   adminController.getAllProducts);
router.put('/products/:id/approve',       adminController.approveProduct);
router.put('/products/:id/reject',        adminController.rejectProduct);
router.put('/products/:id',               adminController.updateProduct);
router.delete('/products/:id',            adminController.deleteProduct);

router.get('/orders',                     adminController.getAllOrders);
router.put('/orders/:id/status',          adminController.updateOrderStatus);

router.get('/buyers',                            adminController.getAllBuyers);
router.get('/buyers/:id',                        adminController.getBuyerById);

router.get('/sellers',                           adminController.getAllSellers);
router.get('/sellers/:id',                       adminController.getSellerById);
router.put('/sellers/:id/approve',               adminController.approveSeller);
router.put('/sellers/:id/reject',                adminController.rejectSeller);

router.get('/category-requests',                 adminController.getCategoryRequests);
router.put('/category-requests/:id/approve',     adminController.approveCategoryRequest);
router.put('/category-requests/:id/reject',      adminController.rejectCategoryRequest);

// Commission tiers
router.get('/commission-tiers',          commissionController.getAll);
router.post('/commission-tiers',         commissionController.create);
router.put('/commission-tiers/:id',      commissionController.update);
router.delete('/commission-tiers/:id',   commissionController.remove);

// Payout requests management
router.get('/payouts',                           adminController.getAllPayoutRequests);
router.put('/payouts/:id/approve',               adminController.approvePayoutRequest);
router.put('/payouts/:id/reject',                adminController.rejectPayoutRequest);

module.exports = router;
