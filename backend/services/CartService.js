const { Cart, CartItem, Product, ProductVariant } = require('../models');

class CartService {
  async getOrCreateCart(userId) {
    const [cart] = await Cart.findOrCreate({ where: { userId } });
    return cart;
  }

  async getCart(userId) {
    const cart = await this.getOrCreateCart(userId);
    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [
        { model: Product, as: 'product' },
        { model: ProductVariant, as: 'variant' },
      ],
    });
    return { cartId: cart.id, items };
  }

  async addItem(userId, productId, quantity = 1, variantId = null) {
    const product = await Product.findByPk(productId);
    if (!product) throw new Error('Product not found');

    let maxStock = product.stock;

    if (variantId) {
      const variant = await ProductVariant.findOne({ where: { id: variantId, productId } });
      if (!variant) throw new Error('Variant not found for this product');
      maxStock = variant.stock;
    }

    const cart = await this.getOrCreateCart(userId);
    const where = { cartId: cart.id, productId, variantId: variantId || null };
    let item = await CartItem.findOne({ where });

    const requestedQuantity = Number(quantity);
    const targetQuantity = item ? item.quantity + requestedQuantity : requestedQuantity;

    if (maxStock !== null && targetQuantity > maxStock) {
      const available = Math.max(0, maxStock);
      throw new Error(`Cannot add to cart. Only ${available} unit(s) left in stock.`);
    }

    if (item) {
      item.quantity = targetQuantity;
      await item.save();
    } else {
      item = await CartItem.create({ cartId: cart.id, productId, variantId: variantId || null, quantity: requestedQuantity });
    }
    return item;
  }

  async updateItem(userId, itemId, quantity) {
    const cart = await this.getOrCreateCart(userId);
    const item = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id },
      include: [
        { model: Product, as: 'product' },
        { model: ProductVariant, as: 'variant' }
      ]
    });
    if (!item) throw new Error('Cart item not found');

    const requestedQuantity = Number(quantity);
    if (requestedQuantity <= 0) {
      await item.destroy();
      return null;
    }

    let maxStock = item.variant ? item.variant.stock : item.product.stock;

    if (maxStock !== null && requestedQuantity > maxStock) {
      const available = Math.max(0, maxStock);
      throw new Error(`Cannot update quantity. Only ${available} unit(s) left in stock.`);
    }

    item.quantity = requestedQuantity;
    await item.save();
    return item;
  }

  async removeItem(userId, itemId) {
    const cart = await this.getOrCreateCart(userId);
    const item = await CartItem.findOne({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new Error('Cart item not found');
    await item.destroy();
  }

  async clearCart(userId) {
    const cart = await this.getOrCreateCart(userId);
    await CartItem.destroy({ where: { cartId: cart.id } });
  }
}

module.exports = new CartService();
