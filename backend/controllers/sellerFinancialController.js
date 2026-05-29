'use strict';
const { SellerLedger, PayoutRequest, User, sequelize, Sequelize } = require('../models');
const { Op } = require('sequelize');

class SellerFinancialController {
  async getFinancialOverview(req, res) {
    try {
      const sellerId = req.user.id;

      // Calculate total cleared balance (sales positive, commissions/payouts negative)
      const clearedResult = await SellerLedger.sum('amount', {
        where: {
          sellerId,
          status: 'cleared'
        }
      });
      const clearedBalance = parseFloat(clearedResult || 0);

      // Calculate total pending payouts
      const pendingPayoutsResult = await PayoutRequest.sum('amount', {
        where: {
          sellerId,
          status: 'pending'
        }
      });
      const pendingPayouts = parseFloat(pendingPayoutsResult || 0);

      const availableBalance = parseFloat((clearedBalance - pendingPayouts).toFixed(2));

      // Fetch all ledger entries
      const ledger = await SellerLedger.findAll({
        where: { sellerId },
        order: [['createdAt', 'DESC']],
        limit: 50
      });

      // Fetch recent payout requests
      const payoutRequests = await PayoutRequest.findAll({
        where: { sellerId },
        order: [['createdAt', 'DESC']],
        limit: 20
      });

      res.json({
        success: true,
        data: {
          clearedBalance,
          pendingPayouts,
          availableBalance,
          ledger,
          payoutRequests
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAnalytics(req, res) {
    try {
      const sellerId = req.user.id;

      // Lifetime totals by type (cleared only for meaningful numbers)
      const lifetimeRows = await SellerLedger.findAll({
        attributes: [
          'type',
          [sequelize.fn('SUM', sequelize.col('amount')), 'total']
        ],
        where: { sellerId, status: 'cleared' },
        group: ['type'],
        raw: true
      });

      const lifetimeMap = Object.fromEntries(lifetimeRows.map(r => [r.type, parseFloat(r.total || 0)]));
      const lifetimeStats = {
        totalSales:       lifetimeMap.sale        || 0,
        totalCommissions: Math.abs(lifetimeMap.commission || 0),
        totalRefunds:     Math.abs(lifetimeMap.refund     || 0),
        totalPayouts:     Math.abs(lifetimeMap.payout     || 0),
        netEarnings:      Object.values(lifetimeMap).reduce((s, v) => s + v, 0)
      };

      // Monthly breakdown — last 6 full months + current month
      const since = new Date();
      since.setMonth(since.getMonth() - 5);
      since.setDate(1);
      since.setHours(0, 0, 0, 0);

      const monthlyRows = await SellerLedger.findAll({
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
          'type',
          [sequelize.fn('SUM', sequelize.col('amount')), 'total']
        ],
        where: { sellerId, status: 'cleared', createdAt: { [Op.gte]: since } },
        group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'type'],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']],
        raw: true
      });

      // Build ordered month slots
      const monthSlots = [];
      const cursor = new Date(since);
      const now = new Date();
      while (cursor <= now) {
        const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
        const label = cursor.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
        monthSlots.push({ key, label, sales: 0, commissions: 0, refunds: 0, payouts: 0, net: 0 });
        cursor.setMonth(cursor.getMonth() + 1);
      }

      for (const row of monthlyRows) {
        const d = new Date(row.month);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const slot = monthSlots.find(s => s.key === key);
        if (!slot) continue;
        const val = parseFloat(row.total || 0);
        if (row.type === 'sale')       slot.sales       += val;
        if (row.type === 'commission') slot.commissions += Math.abs(val);
        if (row.type === 'refund')     slot.refunds     += Math.abs(val);
        if (row.type === 'payout')     slot.payouts     += Math.abs(val);
      }
      for (const slot of monthSlots) {
        slot.net = parseFloat((slot.sales - slot.commissions - slot.refunds - slot.payouts).toFixed(2));
      }

      res.json({ success: true, data: { lifetimeStats, monthlyFlow: monthSlots } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async requestPayout(req, res) {
    const t = await sequelize.transaction();
    try {
      const sellerId = req.user.id;
      const { amount, bankDetails } = req.body;

      const payoutAmount = parseFloat(amount);
      if (isNaN(payoutAmount) || payoutAmount <= 0) {
        throw new Error('Payout amount must be a positive number');
      }

      let finalBankDetails = bankDetails;
      if (!finalBankDetails || !finalBankDetails.accountNumber || !finalBankDetails.bankName) {
        const user = await User.findByPk(sellerId, { transaction: t });
        if (!user || !user.bankDetails || !user.bankDetails.accountNumber) {
          throw new Error('Valid bank details (Account Number, Bank Name) are required. Please link your bank account first.');
        }
        finalBankDetails = user.bankDetails;
      }

      if (!finalBankDetails || !finalBankDetails.accountNumber || !finalBankDetails.bankName) {
        throw new Error('Valid bank details (Account Number, Bank Name) are required');
      }

      // Calculate balance in transaction
      const clearedResult = await SellerLedger.sum('amount', {
        where: { sellerId, status: 'cleared' },
        transaction: t
      });
      const clearedBalance = parseFloat(clearedResult || 0);

      const pendingPayoutsResult = await PayoutRequest.sum('amount', {
        where: { sellerId, status: 'pending' },
        transaction: t
      });
      const pendingPayouts = parseFloat(pendingPayoutsResult || 0);

      const availableBalance = parseFloat((clearedBalance - pendingPayouts).toFixed(2));

      if (payoutAmount > availableBalance) {
        throw new Error(`Insufficient funds. Your available balance is ₹${availableBalance.toLocaleString('en-IN')}, but you requested ₹${payoutAmount.toLocaleString('en-IN')}.`);
      }

      const request = await PayoutRequest.create({
        sellerId,
        amount: payoutAmount,
        status: 'pending',
        bankDetails: finalBankDetails
      }, { transaction: t });

      await t.commit();
      res.status(201).json({ success: true, data: request, message: 'Payout request submitted successfully' });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateBankDetails(req, res) {
    try {
      const sellerId = req.user.id;
      const { bankName, accountNumber, ifsc, accountHolderName } = req.body;

      if (!bankName || typeof bankName !== 'string' || bankName.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Bank name is required' });
      }

      const cleanAcc = (accountNumber || '').toString().trim();
      if (!/^\d{9,18}$/.test(cleanAcc)) {
        return res.status(400).json({ success: false, message: 'Account number must be between 9 and 18 digits' });
      }

      const cleanIfsc = (ifsc || '').toString().trim().toUpperCase();
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
        return res.status(400).json({ success: false, message: 'Invalid IFSC code format (e.g. SBIN0001234)' });
      }

      if (!accountHolderName || typeof accountHolderName !== 'string' || accountHolderName.trim().length < 3) {
        return res.status(400).json({ success: false, message: 'Account holder name must be at least 3 characters' });
      }

      const cleanHolderName = accountHolderName.trim();
      if (!/^[a-zA-Z\s]+$/.test(cleanHolderName)) {
        return res.status(400).json({ success: false, message: 'Account holder name must contain only letters and spaces' });
      }

      const user = await User.findByPk(sellerId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Seller not found' });
      }

      user.bankDetails = {
        bankName: bankName.trim(),
        accountNumber: cleanAcc,
        ifsc: cleanIfsc,
        accountHolderName: cleanHolderName
      };

      await user.save();

      res.json({
        success: true,
        message: 'Bank details linked successfully',
        data: {
          bankDetails: user.bankDetails
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new SellerFinancialController();
