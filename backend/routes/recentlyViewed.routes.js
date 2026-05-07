const express = require('express');
const router = express.Router();
const RecentlyViewedController = require('../controllers/recentlyViewedController');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);
router.get('/', RecentlyViewedController.getHistory);
router.post('/', RecentlyViewedController.track);

module.exports = router;
