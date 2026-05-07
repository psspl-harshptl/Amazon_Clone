const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
  async login(email, password) {
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) throw new Error('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid email or password');

    // Block pending/rejected sellers
    if (user.role === 'seller') {
      if (user.sellerStatus === 'pending') {
        throw new Error('Your seller account is awaiting admin approval');
      }
      if (user.sellerStatus === 'rejected') {
        const reason = user.sellerRejectionReason ? `: ${user.sellerRejectionReason}` : '';
        throw new Error(`Your seller account has been rejected${reason}`);
      }
    }

    const token = this.generateToken(user);
    const userJson = user.toJSON();
    delete userJson.password;
    return { user: userJson, token };
  }

  async register(userData) {
    const { name, email, password } = userData;
    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: email.toLowerCase(), password: hashedPassword });

    const token = this.generateToken(user);
    const userJson = user.toJSON();
    delete userJson.password;
    return { user: userJson, token };
  }

  async sellerRegister(userData) {
    const { name, email, password } = userData;
    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) throw new Error('Email already registered');

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'seller',
      sellerStatus: 'pending',
    });

    const userJson = user.toJSON();
    delete userJson.password;
    // No token — seller must wait for approval before logging in
    return { user: userJson };
  }

  generateToken(user) {
    const payload = { id: user.id, role: user.role };
    if (user.role === 'seller') payload.sellerStatus = user.sellerStatus;
    return jwt.sign(payload, process.env.JWT_SECRET || 'amazon_secret_key', {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  }
}

module.exports = new AuthService();
