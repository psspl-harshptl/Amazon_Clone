require('dotenv').config();
const request = require('supertest');
const app = require('../app');
const { User } = require('../models');

// AuthController spreads result directly: { success, user, token }
const testEmail = `test.auth.${Date.now()}@example.com`;
const testPassword = 'TestPass123!';
let createdUserId;

afterAll(async () => {
  if (createdUserId) {
    await User.destroy({ where: { id: createdUserId } });
  }
});

describe('POST /api/v1/auth/register', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test User', email: testEmail, password: testPassword });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user).not.toHaveProperty('password');
    createdUserId = res.body.user.id;
  });

  it('rejects duplicate email with 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Duplicate', email: testEmail, password: testPassword });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects missing password with 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'No Pass', email: 'nopass@example.com' });

    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('returns a JWT token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('rejects wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: 'WrongPassword!' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects unknown email with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: testPassword });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('Cart endpoints require auth', () => {
  it('GET /api/v1/cart rejects request with no token', async () => {
    const res = await request(app).get('/api/v1/cart');
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/v1/cart/items rejects request with no token', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .send({ productId: 1, quantity: 1 });
    expect(res.statusCode).toBe(401);
  });
});
