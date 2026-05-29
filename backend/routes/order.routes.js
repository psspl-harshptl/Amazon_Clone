const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const auth = require('../middlewares/auth.middleware');

router.post('/', auth, OrderController.createOrder);
router.get('/my-orders', auth, OrderController.getMyOrders);
router.put('/:id/cancel', auth, OrderController.cancelOrder);
router.put('/:id/return', auth, OrderController.requestReturn);
router.get('/:id', auth, OrderController.getOrderById);

module.exports = router;
