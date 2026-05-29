const express = require('express');
const router = express.Router();
const WishlistController = require('../controllers/WishlistController');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', WishlistController.getWishlist);
router.post('/', WishlistController.addToWishlist);
router.delete('/:id', WishlistController.removeFromWishlist);
router.post('/:id/move-to-cart', WishlistController.moveToCart);

module.exports = router;
