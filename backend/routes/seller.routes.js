const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { requireApprovedSeller } = require('../middlewares/role.middleware');
const sellerController = require('../controllers/sellerController');
const variantController = require('../controllers/variantController');
const sellerOrderController = require('../controllers/sellerOrderController');
const sellerFinancialController = require('../controllers/sellerFinancialController');
const commissionController = require('../controllers/commissionController');
const storefrontController = require('../controllers/storefrontController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware, requireApprovedSeller);

router.get('/dashboard',          sellerController.getDashboard);
router.get('/products',           sellerController.getMyProducts);
router.post('/products',          sellerController.createProduct);
router.put('/products/:id',       sellerController.updateProduct);
router.delete('/products/:id',    sellerController.deleteProduct);
router.post('/category-requests', sellerController.requestCategory);

// Bulk product upload
router.post('/products/bulk-upload', upload.single('file'), sellerController.bulkUploadProducts);

// Order Fulfillment
router.get('/orders', sellerOrderController.getMyOrders);
router.put('/orders/items/:itemId/fulfillment', sellerOrderController.updateFulfillmentStatus);
router.get('/orders/items/:itemId/packingslip', sellerOrderController.printPackingSlip);

// Financials & Payouts
router.get('/commission-tiers', commissionController.getTiersForSeller);

router.get('/financials', sellerFinancialController.getFinancialOverview);
router.get('/financials/analytics', sellerFinancialController.getAnalytics);
router.post('/financials/payouts', sellerFinancialController.requestPayout);
router.put('/bank-details', sellerFinancialController.updateBankDetails);

// Storefront settings
router.put('/storefront', storefrontController.updateStorefrontSettings);

// Variant management (fashion only)
router.get('/products/:productId/variants',                     variantController.getVariants);
router.post('/products/:productId/variants',                    variantController.createVariant);
router.put('/products/:productId/variants/:variantId',          variantController.updateVariant);
router.delete('/products/:productId/variants/:variantId',       variantController.deleteVariant);

// Low stock alerts
router.get('/inventory/low-stock', variantController.getLowStock);

module.exports = router;
