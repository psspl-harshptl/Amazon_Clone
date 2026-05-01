const AuthService = require('../services/AuthService');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  async register(req, res) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuthController();
