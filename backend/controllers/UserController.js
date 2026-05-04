const { User } = require('../models');
const bcrypt = require('bcryptjs');

class UserController {
  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const { name, email, phone, address, city, state, zipCode, country, currentPassword, newPassword } = req.body;
      const user = await User.findByPk(req.user.id);

      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      // Handle password change if requested
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ success: false, message: 'Current password is required to set a new one' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Incorrect current password' });
        }
        user.password = await bcrypt.hash(newPassword, 12);
      }

      // Update other fields
      user.name = name || user.name;
      user.email = email || user.email;
      user.phone = phone || user.phone;
      user.address = address || user.address;
      user.city = city || user.city;
      user.state = state || user.state;
      user.zipCode = zipCode || user.zipCode;
      user.country = country || user.country;

      await user.save();

      const updatedUser = user.toJSON();
      delete updatedUser.password;

      res.json({ success: true, message: 'Profile updated successfully', data: updatedUser });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new UserController();
