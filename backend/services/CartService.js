const { Cart, CartItem, Product } = require('../models');

class CartService {
  async getOrCreateCart(userId) {
    const [cart] = await Cart.findOrCreate({ where: { userId } });
    return cart;
  }

  async getCart(userId) {
    const cart = await this.getOrCreateCart(userId);
    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{ model: Product, as: 'product' }],
    });
    return { cartId: cart.id, items };
  }

  async addItem(userId, productId, quantity = 1) {
    const product = await Product.findByPk(productId);
    if (!product) throw new Error('Product not found');

    const cart = await this.getOrCreateCart(userId);
    let item = await CartItem.findOne({ where: { cartId: cart.id, productId } });

    if (item) {
      item.quantity += Number(quantity);
      await item.save();
    } else {
      item = await CartItem.create({ cartId: cart.id, productId, quantity: Number(quantity) });
    }
    return item;
  }

  async updateItem(userId, itemId, quantity) {
    const cart = await this.getOrCreateCart(userId);
    const item = await CartItem.findOne({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new Error('Cart item not found');

    if (Number(quantity) <= 0) {
      await item.destroy();
      return null;
    }
    item.quantity = Number(quantity);
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
