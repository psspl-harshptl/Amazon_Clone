'use strict';
const CommissionService = require('../services/CommissionService');

class CommissionController {
  // Admin — full CRUD
  async getAll(req, res) {
    try {
      const data = await CommissionService.getAllTiers();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const tier = await CommissionService.createTier(req.body);
      res.status(201).json({ success: true, data: tier });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const tier = await CommissionService.updateTier(req.params.id, req.body);
      res.json({ success: true, data: tier });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async remove(req, res) {
    try {
      await CommissionService.deleteTier(req.params.id);
      res.json({ success: true, message: 'Tier deleted' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Seller / public — read-only preview
  async getTiersForSeller(req, res) {
    try {
      const data = await CommissionService.getAllTiers();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CommissionController();
