const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const auth = require('../middlewares/auth.middleware');

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/seller/register', AuthController.sellerRegister);
router.get('/me', auth, AuthController.me);

module.exports = router;
