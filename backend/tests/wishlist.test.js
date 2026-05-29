require('dotenv').config();
const request = require('supertest');
const app = require('../app');
const { User, WishlistItem, Product, Cart, CartItem } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let token;
let testUser;
let testProduct;
let wishlistItemId;

beforeAll(async () => {
  testUser = await User.create({
    name: 'Wishlist Test User',
    email: `test.wishlist.${Date.now()}@example.com`,
    password: await bcrypt.hash('TestPass123!', 12),
    role: 'buyer',
  });

  token = jwt.sign(
    { id: testUser.id, email: testUser.email, role: testUser.role },
    process.env.JWT_SECRET || 'amazon_secret_key',
    { expiresIn: '1h' }
  );

  testProduct = await Product.findOne();
  if (!testProduct) throw new Error('No products in DB — run seeders first');
});

afterAll(async () => {
  if (testUser) {
    await WishlistItem.destroy({ where: { userId: testUser.id } });
    const cart = await Cart.findOne({ where: { userId: testUser.id } });
    if (cart) await CartItem.destroy({ where: { cartId: cart.id } });
    await Cart.destroy({ where: { userId: testUser.id } });
    await User.destroy({ where: { id: testUser.id } });
  }
});

describe('Wishlist API', () => {
  it('GET /api/v1/wishlist returns empty wishlist initially', async () => {
    const res = await request(app)
      .get('/api/v1/wishlist')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('POST /api/v1/wishlist adds a product to wishlist', async () => {
    const res = await request(app)
      .post('/api/v1/wishlist')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: testProduct.id });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.productId).toBe(testProduct.id);
    wishlistItemId = res.body.data.id;
  });

  it('POST /api/v1/wishlist returns notice for duplicate addition', async () => {
    const res = await request(app)
      .post('/api/v1/wishlist')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: testProduct.id });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('already');
  });

  it('GET /api/v1/wishlist returns the item with nested product details', async () => {
    const res = await request(app)
      .get('/api/v1/wishlist')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe(wishlistItemId);
    expect(res.body.data[0].product.id).toBe(testProduct.id);
    expect(res.body.data[0].product.name).toBe(testProduct.name);
  });

  it('POST /api/v1/wishlist/:id/move-to-cart adds item to cart and removes from wishlist', async () => {
    const res = await request(app)
      .post(`/api/v1/wishlist/${wishlistItemId}/move-to-cart`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it is no longer in the wishlist
    const wishRes = await request(app)
      .get('/api/v1/wishlist')
      .set('Authorization', `Bearer ${token}`);
    expect(wishRes.body.data.length).toBe(0);

    // Verify it is in the cart
    const cartRes = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${token}`);
    expect(cartRes.body.data.items.length).toBe(1);
    expect(cartRes.body.data.items[0].productId).toBe(testProduct.id);
  });

  it('DELETE /api/v1/wishlist/:id removes a wishlist item', async () => {
    // Add it back to wishlist first
    const addRes = await request(app)
      .post('/api/v1/wishlist')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: testProduct.id });
    const newId = addRes.body.data.id;

    // Delete it
    const delRes = await request(app)
      .delete(`/api/v1/wishlist/${newId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Verify it is gone
    const wishRes = await request(app)
      .get('/api/v1/wishlist')
      .set('Authorization', `Bearer ${token}`);
    expect(wishRes.body.data.length).toBe(0);
  });
});
