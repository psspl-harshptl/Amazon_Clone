require('dotenv').config();
const request = require('supertest');
const app = require('../app');
const { User, Cart, CartItem, Product } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let token;
let testUser;
let testProduct;
let cartItemId;

beforeAll(async () => {
  testUser = await User.create({
    name: 'Cart Test User',
    email: `test.cart.${Date.now()}@example.com`,
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
    const cart = await Cart.findOne({ where: { userId: testUser.id } });
    if (cart) await CartItem.destroy({ where: { cartId: cart.id } });
    await Cart.destroy({ where: { userId: testUser.id } });
    await User.destroy({ where: { id: testUser.id } });
  }
});

describe('GET /api/v1/cart', () => {
  it('returns empty cart for a new user', async () => {
    const res = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toEqual([]);
  });

  it('rejects unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/v1/cart');
    expect(res.statusCode).toBe(401);
  });
});

describe('POST /api/v1/cart/items', () => {
  it('adds a product to cart', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: testProduct.id, quantity: 2 });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.productId).toBe(testProduct.id);
    expect(res.body.data.quantity).toBe(2);
    cartItemId = res.body.data.id;
  });

  it('increments quantity when adding same product again', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: testProduct.id, quantity: 1 });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.quantity).toBe(3);
  });

  it('rejects request without productId with 400', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 1 });

    expect(res.statusCode).toBe(400);
  });

  it('rejects non-existent productId with 404', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: 999999, quantity: 1 });

    expect(res.statusCode).toBe(404);
  });
});

describe('GET /api/v1/cart (after adding items)', () => {
  it('returns cart with the added item', async () => {
    const res = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].productId).toBe(testProduct.id);
    expect(res.body.data.items[0].product).toBeDefined();
  });
});

describe('PUT /api/v1/cart/items/:itemId', () => {
  it('updates item quantity', async () => {
    const res = await request(app)
      .put(`/api/v1/cart/items/${cartItemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 5 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.quantity).toBe(5);
  });

  it('removes item when quantity set to 0', async () => {
    const res = await request(app)
      .put(`/api/v1/cart/items/${cartItemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 0 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeNull();
  });
});

describe('POST /api/v1/cart/items (re-add for delete tests)', () => {
  it('re-adds product to cart', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: testProduct.id, quantity: 1 });

    expect(res.statusCode).toBe(201);
    cartItemId = res.body.data.id;
  });
});

describe('DELETE /api/v1/cart/items/:itemId', () => {
  it('removes a specific item from cart', async () => {
    const res = await request(app)
      .delete(`/api/v1/cart/items/${cartItemId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 for already-removed item', async () => {
    const res = await request(app)
      .delete(`/api/v1/cart/items/${cartItemId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /api/v1/cart', () => {
  beforeAll(async () => {
    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: testProduct.id, quantity: 3 });
  });

  it('clears all items from cart', async () => {
    const res = await request(app)
      .delete('/api/v1/cart')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const cartRes = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${token}`);

    expect(cartRes.body.data.items).toEqual([]);
  });
});
