const { Address } = require('../models');

class AddressController {
  async getAddresses(req, res) {
    try {
      const userId = req.user.id;
      const addresses = await Address.findAll({
        where: { userId },
        order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
      });
      res.json({ success: true, data: addresses });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createAddress(req, res) {
    try {
      const userId = req.user.id;
      const { fullName, phone, streetAddress, city, state, zipCode, country, isDefault } = req.body;

      if (!fullName || !phone || !streetAddress || !city || !state || !zipCode) {
        return res.status(400).json({ success: false, message: 'All address fields are required' });
      }

      // Check if this is the first address for the user
      const count = await Address.count({ where: { userId } });
      const makeDefault = count === 0 ? true : !!isDefault;

      if (makeDefault) {
        // Set all other addresses for this user to non-default
        await Address.update({ isDefault: false }, { where: { userId } });
      }

      const address = await Address.create({
        userId,
        fullName,
        phone,
        streetAddress,
        city,
        state,
        zipCode,
        country: country || 'India',
        isDefault: makeDefault,
      });

      res.status(201).json({ success: true, data: address });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateAddress(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { fullName, phone, streetAddress, city, state, zipCode, country, isDefault } = req.body;

      const address = await Address.findOne({ where: { id, userId } });
      if (!address) {
        return res.status(404).json({ success: false, message: 'Address not found' });
      }

      const makeDefault = !!isDefault;
      if (makeDefault && !address.isDefault) {
        // Set all other addresses to non-default
        await Address.update({ isDefault: false }, { where: { userId } });
      }

      await address.update({
        fullName: fullName || address.fullName,
        phone: phone || address.phone,
        streetAddress: streetAddress || address.streetAddress,
        city: city || address.city,
        state: state || address.state,
        zipCode: zipCode || address.zipCode,
        country: country || address.country,
        isDefault: makeDefault || address.isDefault,
      });

      res.json({ success: true, data: address });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteAddress(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const address = await Address.findOne({ where: { id, userId } });
      if (!address) {
        return res.status(404).json({ success: false, message: 'Address not found' });
      }

      const wasDefault = address.isDefault;
      await address.destroy();

      // If we deleted the default address, make the most recent remaining one the default
      if (wasDefault) {
        const nextDefault = await Address.findOne({
          where: { userId },
          order: [['createdAt', 'DESC']],
        });
        if (nextDefault) {
          await nextDefault.update({ isDefault: true });
        }
      }

      res.json({ success: true, message: 'Address deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async setDefaultAddress(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const address = await Address.findOne({ where: { id, userId } });
      if (!address) {
        return res.status(404).json({ success: false, message: 'Address not found' });
      }

      // Reset all defaults first
      await Address.update({ isDefault: false }, { where: { userId } });
      await address.update({ isDefault: true });

      res.json({ success: true, data: address, message: 'Default address updated' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AddressController();
