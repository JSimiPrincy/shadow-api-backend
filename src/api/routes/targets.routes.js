const express = require('express');
const router = express.Router();
const targetController = require('../controllers/targetController');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/rbacMiddleware');

// All routes require Login (protect)
router.use(protect);

// 1. List & Create
router.get('/', targetController.getAllTargets); // All users
router.post('/', authorize('ADMIN'), targetController.createTarget); // Admin only

// 2. Specific Target Operations
router.get('/:id', targetController.getTargetById); // All users
router.put('/:id', authorize('ADMIN'), targetController.updateTarget); // Admin only
router.delete('/:id', authorize('ADMIN'), targetController.deleteTarget); // Admin only

// 3. Credentials
router.post('/:id/credentials', authorize('ADMIN'), targetController.storeCredentials); // Admin only

module.exports = router;