const { WishlistItem, Product, ProductVariant, ProductImage } = require('../models');
const CartService = require('../services/CartService');

class WishlistController {
  async getWishlist(req, res) {
    try {
      const userId = req.user.id;
      const items = await WishlistItem.findAll({
        where: { userId },
        include: [
          {
            model: Product,
            as: 'product',
            include: [
              { model: ProductImage, as: 'galleryImages', attributes: ['id', 'url', 'isMain'] }
            ]
          },
          {
            model: ProductVariant,
            as: 'variant',
          },
        ],
        order: [['createdAt', 'DESC']],
      });
      res.json({ success: true, data: items });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async addToWishlist(req, res) {
    try {
      const userId = req.user.id;
      const { productId, variantId = null } = req.body;

      if (!productId) {
        return res.status(400).json({ success: false, message: 'productId is required' });
      }

      // Check product existence
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      // Check variant existence if variantId provided
      if (variantId) {
        const variant = await ProductVariant.findOne({ where: { id: variantId, productId } });
        if (!variant) {
          return res.status(404).json({ success: false, message: 'Product variant not found' });
        }
      }

      // Find or create
      const [item, created] = await WishlistItem.findOrCreate({
        where: {
          userId,
          productId,
          variantId: variantId || null,
        },
      });

      res.status(201).json({
        success: true,
        data: item,
        message: created ? 'Added to Wish List' : 'Product is already in your Wish List',
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async removeFromWishlist(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const item = await WishlistItem.findOne({ where: { id, userId } });
      if (!item) {
        return res.status(404).json({ success: false, message: 'Wish List item not found' });
      }

      await item.destroy();
      res.json({ success: true, message: 'Removed from Wish List' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async moveToCart(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const item = await WishlistItem.findOne({ where: { id, userId } });
      if (!item) {
        return res.status(404).json({ success: false, message: 'Wish List item not found' });
      }

      // Add to cart using existing CartService
      await CartService.addItem(userId, item.productId, 1, item.variantId);

      // Remove from wishlist
      await item.destroy();

      res.json({ success: true, message: 'Moved item to Cart' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new WishlistController();
