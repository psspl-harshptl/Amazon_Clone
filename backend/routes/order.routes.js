const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const auth = require('../middlewares/auth.middleware');

router.post('/', auth, OrderController.createOrder);
router.get('/my-orders', auth, OrderController.getMyOrders);
router.get('/:id', auth, OrderController.getOrderById);

module.exports = router;
