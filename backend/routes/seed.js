const express = require('express');
const router = express.Router();
const seedController = require('../controllers/seedController');
const { authenticateToken, authorize } = require('../middleware/auth');

/**
 * Seed Data Routes
 * Base: /api/seed
 */

// Middleware: require admin authentication
router.use(authenticateToken);
router.use(authorize('admin'));

// POST /api/seed/facilities - Seed facilities data
router.post('/facilities', seedController.seedFacilities);

// GET /api/seed/count - Get facilities count
router.get('/count', seedController.getCount);

module.exports = router;
