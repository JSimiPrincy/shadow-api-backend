const express = require('express');
const router = express.Router();
const riskController = require('../controllers/riskController');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/rbacMiddleware');

router.use(protect);

// 1. Get All Risks
router.get('/', riskController.getAllRisks);

// 2. Attack Surface Summary
router.get('/attack-surface/summary', riskController.getSummary);

// 3. Heatmap Data
router.get('/attack-surface/heatmap', riskController.getHeatmap);

// 4. Recalculate (Admin)
router.post('/recalculate', authorize('ADMIN'), riskController.recalculateAll);

// 5. Specific API Risk
router.get('/:apiId', riskController.getRiskByApi);

module.exports = router;