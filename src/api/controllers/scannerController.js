const scannerService = require('../../services/scannerService');

exports.startScan = async (req, res) => {
  try {
    const { targetId } = req.body;
    if (!targetId) return res.status(400).json({ success: false, message: 'Target ID required' });

    const job = await scannerService.startScan(targetId);
    res.status(202).json({ success: true, message: 'Scan initiated', data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.stopScan = async (req, res) => {
  try {
    const { scanJobId } = req.body;
    const result = await scannerService.stopScan(scanJobId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const { targetId } = req.params;
    const status = await scannerService.getStatus(targetId);
    res.status(200).json({ success: true, data: status });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.restartScan = async (req, res) => {
  try {
    const { targetId } = req.params;
    const job = await scannerService.restartScan(targetId);
    res.status(202).json({ success: true, message: 'Scan restarted', data: job });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};