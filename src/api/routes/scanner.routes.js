const express = require('express');
const router = express.Router();
const scannerController = require('../controllers/scannerController');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/rbacMiddleware');

router.use(protect);

// Start Scan (Admin) - Body: { targetId: "..." }
router.post('/start', authorize('ADMIN'), scannerController.startScan);

// Stop Scan (Admin) - Body: { scanJobId: "..." }
router.post('/stop', authorize('ADMIN'), scannerController.stopScan);

// Get Status (User)
router.get('/status/:targetId', scannerController.getStatus);

// Restart (Admin)
router.post('/restart/:targetId', authorize('ADMIN'), scannerController.restartScan);

module.exports = router;