const express = require('express');
const router = express.Router();
const exposureController = require('../controllers/exposureController');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/rbacMiddleware');

router.use(protect);

// 1. List all exposures
router.get('/', exposureController.getAllExposures);

// 2. PII Report (Admin only)
router.get('/pii', authorize('ADMIN'), exposureController.getPiiReport);

// 3. Specific API Exposure
router.get('/:apiId', exposureController.getExposuresByApi);

// 4. Trigger Analysis (System/Admin)
router.post('/analyze', authorize('ADMIN'), exposureController.triggerAnalysis);

module.exports = router;