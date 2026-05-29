require('dotenv').config();
const request = require('supertest');
const app = require('../app');
const { User, Category, Product, ProductVariant, Order, OrderItem, SellerLedger, PayoutRequest } = require('../models');
const jwt = require('jsonwebtoken');

describe('Seller Module Enhancements Integration Tests', () => {
  let adminToken, sellerToken, buyerToken;
  let adminUser, sellerUser, buyerUser;
  let category;
  let product;
  let order;
  let orderItem;
  let payoutRequest;

  beforeAll(async () => {
    // 1. Create category
    category = await Category.create({
      name: `TestCat_${Date.now()}`,
      slug: `testcat-${Date.now()}`
    });

    // 2. Register users
    const timestamp = Date.now();
    
    // Register Seller
    const sellerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test Seller', email: `seller_${timestamp}@example.com`, password: 'Password123!' });
    sellerUser = await User.findByPk(sellerRes.body.user.id);

    // Force approve seller and generate correct token
    await sellerUser.update({ role: 'seller', sellerStatus: 'approved' });
    sellerToken = jwt.sign(
      { id: sellerUser.id, role: 'seller', sellerStatus: 'approved' },
      process.env.JWT_SECRET || 'amazon_secret_key'
    );

    // Register Buyer
    const buyerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test Buyer', email: `buyer_${timestamp}@example.com`, password: 'Password123!' });
    buyerUser = await User.findByPk(buyerRes.body.user.id);
    buyerToken = buyerRes.body.token;

    // Register Admin
    const adminRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test Admin', email: `admin_${timestamp}@example.com`, password: 'Password123!' });
    adminUser = await User.findByPk(adminRes.body.user.id);
    await adminUser.update({ role: 'super_admin' });
    adminToken = jwt.sign(
      { id: adminUser.id, role: 'super_admin' },
      process.env.JWT_SECRET || 'amazon_secret_key'
    );

    // 3. Create a starting product for seller
    product = await Product.create({
      sellerId: sellerUser.id,
      name: 'Seller Fulfillment Test Product',
      slug: `fulfill-test-${timestamp}`,
      description: 'Fulfillment test product description',
      price: 100.00,
      mrp: 120.00,
      stock: 10,
      categoryId: category.id,
      status: 'approved'
    });
  });

  afterAll(async () => {
    // Cleanup database
    if (order) {
      await OrderItem.destroy({ where: { orderId: order.id } });
      await Order.destroy({ where: { id: order.id } });
    }
    await SellerLedger.destroy({ where: { sellerId: sellerUser.id } });
    await PayoutRequest.destroy({ where: { sellerId: sellerUser.id } });
    if (product) {
      await Product.destroy({ where: { id: product.id } });
    }
    await User.destroy({ where: { id: [sellerUser.id, buyerUser.id, adminUser.id] } });
    await Category.destroy({ where: { id: category.id } });
  });

  describe('1. CSV Bulk Upload', () => {
    it('should successfully bulk upload products and log status', async () => {
      const csvContent = `name,description,price,mrp,stock,category,brand,image_url
Bulk Laptop,High performance laptop,999.99,1200.00,5,${category.name},Dell,http://example.com/laptop.jpg
Bulk Keyboard,,29.99,35.00,10,${category.name},Logitech,
Bulk BadCategory,Invalid item,10.00,,5,NonExistentCategory,,`;

      const res = await request(app)
        .post('/api/v1/seller/products/bulk-upload')
        .set('Authorization', `Bearer ${sellerToken}`)
        .attach('file', Buffer.from(csvContent), 'products.csv');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.successCount).toBe(2);
      expect(res.body.data.failureCount).toBe(1);
      
      const logs = res.body.data.logs;
      expect(logs[0].status).toBe('success');
      expect(logs[1].status).toBe('success');
      expect(logs[2].status).toBe('failure');
      expect(logs[2].message).toContain('does not exist');

      // Cleanup bulk products
      const bulkNames = ['Bulk Laptop', 'Bulk Keyboard'];
      await Product.destroy({ where: { name: bulkNames, sellerId: sellerUser.id } });
    });
  });

  describe('2. Public Storefront Customization', () => {
    it('should allow seller to edit storefront settings', async () => {
      const res = await request(app)
        .put('/api/v1/seller/storefront')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          storeName: 'Awesome Gadgets Store',
          storeDescription: 'We sell the best electronics in town!',
          storeBanner: 'http://example.com/banner.jpg',
          storeLogo: 'http://example.com/logo.jpg'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.storeName).toBe('Awesome Gadgets Store');
      expect(res.body.data.storeDescription).toBe('We sell the best electronics in town!');
    });

    it('should fail if storeName is empty', async () => {
      const res = await request(app)
        .put('/api/v1/seller/storefront')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          storeName: '',
          storeDescription: 'Invalid store settings'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Store name is required');
    });

    it('should allow public access to storefront page details', async () => {
      const res = await request(app)
        .get(`/api/v1/stores/${sellerUser.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.seller.storeName).toBe('Awesome Gadgets Store');
      expect(res.body.data.products).toBeInstanceOf(Array);
      expect(res.body.data.products.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('3. Order Fulfillment & Multi-Vendor Tracking', () => {
    it('should allow seller to fetch order items and update status', async () => {
      // Create a test order manually
      order = await Order.create({
        userId: buyerUser.id,
        totalAmount: 140.00,
        shippingAddress: { name: 'Test Buyer', address: '123 Buyer St', city: 'Mumbai', state: 'MH', zipCode: '400001', country: 'India' },
        paymentMethod: 'COD',
        status: 'pending'
      });

      orderItem = await OrderItem.create({
        orderId: order.id,
        productId: product.id,
        quantity: 1,
        priceAtPurchase: 100.00,
        status: 'pending'
      });

      // Seller fetches orders
      const listRes = await request(app)
        .get('/api/v1/seller/orders')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(listRes.statusCode).toBe(200);
      expect(listRes.body.success).toBe(true);
      expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

      // Seller updates fulfillment status to packed
      let updateRes = await request(app)
        .put(`/api/v1/seller/orders/items/${orderItem.id}/fulfillment`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ status: 'packed' });

      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.data.status).toBe('packed');

      // Update to shipped without tracking details should fail
      updateRes = await request(app)
        .put(`/api/v1/seller/orders/items/${orderItem.id}/fulfillment`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ status: 'shipped' });

      expect(updateRes.statusCode).toBe(400);

      // Update to shipped with details
      updateRes = await request(app)
        .put(`/api/v1/seller/orders/items/${orderItem.id}/fulfillment`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ status: 'shipped', carrierName: 'BlueDart', trackingNumber: 'BD12345678' });

      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.data.status).toBe('shipped');
      
      // Parent order should automatically update to 'shipped'
      const parentOrder = await Order.findByPk(order.id);
      expect(parentOrder.status).toBe('shipped');
    });

    it('should generate packing slip HTML', async () => {
      const res = await request(app)
        .get(`/api/v1/seller/orders/items/${orderItem.id}/packingslip`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Packing Slip');
      expect(res.text).toContain('BD12345678');
    });
  });

  describe('4. Financial Ledger, Commissions, & Payouts', () => {
    it('should calculate balance and ledger on item delivery (90% seller share, 10% commission)', async () => {
      // Mark item as delivered
      const updateRes = await request(app)
        .put(`/api/v1/seller/orders/items/${orderItem.id}/fulfillment`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ status: 'delivered' });

      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.data.status).toBe('delivered');

      // Check ledger entries
      const saleLedger = await SellerLedger.findOne({ where: { orderItemId: orderItem.id, type: 'sale' } });
      const commissionLedger = await SellerLedger.findOne({ where: { orderItemId: orderItem.id, type: 'commission' } });

      expect(saleLedger).not.toBeNull();
      expect(parseFloat(saleLedger.amount)).toBe(100.00);

      expect(commissionLedger).not.toBeNull();
      expect(parseFloat(commissionLedger.amount)).toBe(-10.00);

      // Get financial overview
      const overviewRes = await request(app)
        .get('/api/v1/seller/financials')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(overviewRes.statusCode).toBe(200);
      expect(overviewRes.body.data.clearedBalance).toBe(90.00);
      expect(overviewRes.body.data.availableBalance).toBe(90.00);
    });

    it('should block payout requests exceeding available balance', async () => {
      const res = await request(app)
        .post('/api/v1/seller/financials/payouts')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          amount: 100.00,
          bankDetails: { accountNumber: '123456789', bankName: 'HDFC Bank', ifsc: 'HDFC0001234' }
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Insufficient funds');
    });

    it('should successfully submit valid payout requests and adjust available balance', async () => {
      const res = await request(app)
        .post('/api/v1/seller/financials/payouts')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          amount: 50.00,
          bankDetails: { accountNumber: '123456789', bankName: 'HDFC Bank', ifsc: 'HDFC0001234' }
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      payoutRequest = res.body.data;

      // Overview should show available balance reduced by pending payouts (90 - 50 = 40)
      const overviewRes = await request(app)
        .get('/api/v1/seller/financials')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(overviewRes.body.data.availableBalance).toBe(40.00);
      expect(overviewRes.body.data.pendingPayouts).toBe(50.00);
    });

    it('should allow admin to list, reject, and approve payout requests, updating ledger', async () => {
      // 1. Admin lists payouts
      let listRes = await request(app)
        .get('/api/v1/admin/payouts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listRes.statusCode).toBe(200);
      expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

      // 2. Admin rejects first payout (let's create and reject one)
      const mockPayout = await PayoutRequest.create({
        sellerId: sellerUser.id,
        amount: 10.00,
        status: 'pending',
        bankDetails: { accountNumber: '9999', bankName: 'SBI' }
      });

      let rejectRes = await request(app)
        .put(`/api/v1/admin/payouts/${mockPayout.id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Incorrect details' });

      expect(rejectRes.statusCode).toBe(200);
      expect(rejectRes.body.data.status).toBe('rejected');
      expect(rejectRes.body.data.rejectionReason).toBe('Incorrect details');

      await mockPayout.destroy();

      // 3. Admin approves the actual payout request
      let approveRes = await request(app)
        .put(`/api/v1/admin/payouts/${payoutRequest.id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(approveRes.statusCode).toBe(200);
      expect(approveRes.body.data.status).toBe('approved');

      // Ledger should contain the negative payout record
      const payoutLedger = await SellerLedger.findOne({ where: { sellerId: sellerUser.id, type: 'payout' } });
      expect(payoutLedger).not.toBeNull();
      expect(parseFloat(payoutLedger.amount)).toBe(-50.00);

      // Final financial overview check:
      // Cleared balance should be: 90 (earnings) - 50 (approved payout) = 40
      // Pending payouts: 0
      // Available balance: 40
      const overviewRes = await request(app)
        .get('/api/v1/seller/financials')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(overviewRes.body.data.clearedBalance).toBe(40.00);
      expect(overviewRes.body.data.pendingPayouts).toBe(0.00);
      expect(overviewRes.body.data.availableBalance).toBe(40.00);
    });

    it('should fail to link bank details with invalid inputs', async () => {
      // 1. Invalid account number (non-digits)
      let res = await request(app)
        .put('/api/v1/seller/bank-details')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          bankName: 'HDFC Bank',
          accountNumber: 'abc1234567',
          ifsc: 'HDFC0001234',
          accountHolderName: 'Rahul Sharma'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Account number must be between 9 and 18 digits');

      // 2. Invalid IFSC format
      res = await request(app)
        .put('/api/v1/seller/bank-details')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          bankName: 'HDFC Bank',
          accountNumber: '1234567890',
          ifsc: 'HDFC000abc',
          accountHolderName: 'Rahul Sharma'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Invalid IFSC code format');

      // 3. Short account holder name
      res = await request(app)
        .put('/api/v1/seller/bank-details')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          bankName: 'HDFC Bank',
          accountNumber: '1234567890',
          ifsc: 'HDFC0001234',
          accountHolderName: 'Ra'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Account holder name must be at least 3 characters');
    });

    it('should successfully link bank details with valid inputs', async () => {
      const res = await request(app)
        .put('/api/v1/seller/bank-details')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          bankName: 'ICICI Bank',
          accountNumber: '9876543210',
          ifsc: 'ICIC0005678',
          accountHolderName: 'Rahul Sharma'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bankDetails.bankName).toBe('ICICI Bank');
      expect(res.body.data.bankDetails.accountNumber).toBe('9876543210');
    });

    it('should successfully submit payout request using pre-linked bank details', async () => {
      const res = await request(app)
        .post('/api/v1/seller/financials/payouts')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          amount: 10.00
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bankDetails.bankName).toBe('ICICI Bank');
      expect(res.body.data.bankDetails.accountNumber).toBe('9876543210');
    });
  });
});
