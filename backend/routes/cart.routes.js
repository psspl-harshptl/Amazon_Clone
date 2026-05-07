const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', CartController.getCart);
router.post('/items', CartController.addItem);
router.put('/items/:itemId', CartController.updateItem);
router.delete('/items/:itemId', CartController.removeItem);
router.delete('/', CartController.clearCart);

module.exports = router;
