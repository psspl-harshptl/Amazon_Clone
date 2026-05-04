const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
  async login(email, password) {
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user.id);
    
    // Remove password from user object
    const userJson = user.toJSON();
    delete userJson.password;

    return { user: userJson, token };
  }

  async register(userData) {
    const { name, email, password } = userData;
    
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    const token = this.generateToken(user.id);
    
    const userJson = user.toJSON();
    delete userJson.password;

    return { user: userJson, token };
  }

  generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'amazon_secret_key', {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }
}

module.exports = new AuthService();
