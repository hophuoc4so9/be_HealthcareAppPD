const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorize('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/recent-appointments', adminController.getRecentAppointments);

module.exports = router;
