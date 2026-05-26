const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middlewares/auth.middleware');

router.get('/product/:productId',          reviewController.getProductReviews);
router.get('/can-review/:productId', auth,  reviewController.canReview);
router.post('/', auth,                      reviewController.createReview);

module.exports = router;
