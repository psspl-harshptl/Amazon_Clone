require('dotenv').config();
const request = require('supertest');
const app = require('../app');
const { User, Address } = require('../models');

const testEmail = `test.address.${Date.now()}@example.com`;
const testPassword = 'TestPass123!';
let userId;
let token;
let addressId1;
let addressId2;

beforeAll(async () => {
  // Register user
  const regRes = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'Address Tester', email: testEmail, password: testPassword });
  userId = regRes.body.user.id;
  token = regRes.body.token;
});

afterAll(async () => {
  if (userId) {
    await Address.destroy({ where: { userId } });
    await User.destroy({ where: { id: userId } });
  }
});

describe('Addresses API', () => {
  it('GET /api/v1/addresses returns empty list initially', async () => {
    const res = await request(app)
      .get('/api/v1/addresses')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBe(0);
  });

  it('POST /api/v1/addresses creates a default address if first', async () => {
    const res = await request(app)
      .post('/api/v1/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fullName: 'John Doe',
        phone: '9876543210',
        streetAddress: '123 Test Street, Block A',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India',
        isDefault: false, // will become true because it is the first one
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.fullName).toBe('John Doe');
    expect(res.body.data.isDefault).toBe(true);
    addressId1 = res.body.data.id;
  });

  it('POST /api/v1/addresses creates a second address as non-default', async () => {
    const res = await request(app)
      .post('/api/v1/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fullName: 'Jane Doe',
        phone: '1234567890',
        streetAddress: '456 Sample Blvd',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        country: 'India',
        isDefault: false,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.fullName).toBe('Jane Doe');
    expect(res.body.data.isDefault).toBe(false);
    addressId2 = res.body.data.id;
  });

  it('PUT /api/v1/addresses/:id updates details', async () => {
    const res = await request(app)
      .put(`/api/v1/addresses/${addressId2}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        fullName: 'Jane Smith',
        phone: '1112223333',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe('Jane Smith');
    expect(res.body.data.phone).toBe('1112223333');
  });

  it('PUT /api/v1/addresses/:id/set-default changes the default address', async () => {
    const res = await request(app)
      .put(`/api/v1/addresses/${addressId2}/set-default`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isDefault).toBe(true);

    // Verify first address is no longer default
    const getRes = await request(app)
      .get('/api/v1/addresses')
      .set('Authorization', `Bearer ${token}`);

    const addr1 = getRes.body.data.find(a => a.id === addressId1);
    expect(addr1.isDefault).toBe(false);
  });

  it('DELETE /api/v1/addresses/:id removes address and resets default if deleted default', async () => {
    // Delete address2 (which is current default)
    const res = await request(app)
      .delete(`/api/v1/addresses/${addressId2}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // Address1 should have automatically become default again
    const getRes = await request(app)
      .get('/api/v1/addresses')
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.body.data.length).toBe(1);
    expect(getRes.body.data[0].id).toBe(addressId1);
    expect(getRes.body.data[0].isDefault).toBe(true);
  });
});
