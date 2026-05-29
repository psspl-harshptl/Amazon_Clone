'use strict';
const { User, Product, Category, ProductImage } = require('../models');

class StorefrontController {
  async getStorefront(req, res) {
    try {
      const { sellerId } = req.params;

      const seller = await User.findOne({
        where: {
          id: sellerId,
          role: 'seller',
          sellerStatus: 'approved'
        },
        attributes: ['id', 'name', 'storeName', 'storeLogo', 'storeBanner', 'storeDescription']
      });

      if (!seller) {
        return res.status(404).json({ success: false, message: 'Storefront not found or not approved' });
      }

      const products = await Product.findAll({
        where: {
          sellerId,
          status: 'approved'
        },
        include: [
          { model: Category, as: 'category' }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          seller,
          products
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateStorefrontSettings(req, res) {
    try {
      const sellerId = req.user.id;
      const { storeName, storeLogo, storeBanner, storeDescription } = req.body;

      if (!storeName || typeof storeName !== 'string' || storeName.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Store name is required' });
      }

      const seller = await User.findByPk(sellerId);
      if (!seller) {
        return res.status(404).json({ success: false, message: 'Seller not found' });
      }

      await seller.update({
        storeName: storeName.trim(),
        storeLogo: storeLogo !== undefined ? storeLogo : seller.storeLogo,
        storeBanner: storeBanner !== undefined ? storeBanner : seller.storeBanner,
        storeDescription: storeDescription !== undefined ? storeDescription : seller.storeDescription
      });

      res.json({
        success: true,
        data: {
          id: seller.id,
          name: seller.name,
          storeName: seller.storeName,
          storeLogo: seller.storeLogo,
          storeBanner: seller.storeBanner,
          storeDescription: seller.storeDescription
        },
        message: 'Storefront updated successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new StorefrontController();
