const express = require('express');
const router = express.Router();
const shadowApiController = require('../controllers/shadowApiController');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/rbacMiddleware');

router.use(protect); // All routes require login

// 1. Get All Discovered APIs
router.get('/', shadowApiController.getAll);

// 2. Unauthenticated APIs (Security Risk)
router.get('/unauthenticated', shadowApiController.getUnauthenticated);

// 3. By Target
router.get('/target/:targetId', shadowApiController.getByTarget);

// 4. Auto-classify (System/Admin function)
router.post('/classify', authorize('ADMIN'), shadowApiController.classify);

// 5. Specific API Details (Put this last to avoid collision with /target or /classify)
router.get('/:id', shadowApiController.getById);

module.exports = router;