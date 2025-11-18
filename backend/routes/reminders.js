const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorize('patient'));

router.post('/', reminderController.validateReminder(), reminderController.createReminder);
router.get('/', reminderController.getMyReminders);
router.put('/:id', reminderController.updateReminder);
router.patch('/:id/toggle', reminderController.toggleActive);
router.delete('/:id', reminderController.deleteReminder);

module.exports = router;
