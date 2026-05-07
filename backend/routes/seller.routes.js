const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { requireApprovedSeller } = require('../middlewares/role.middleware');
const sellerController = require('../controllers/sellerController');

router.use(authMiddleware, requireApprovedSeller);

router.get('/dashboard',    sellerController.getDashboard);
router.get('/products',     sellerController.getMyProducts);
router.post('/products',    sellerController.createProduct);
router.put('/products/:id', sellerController.updateProduct);
router.delete('/products/:id', sellerController.deleteProduct);

module.exports = router;
