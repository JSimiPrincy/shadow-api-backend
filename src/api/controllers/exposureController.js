const exposureService = require('../../services/exposureService');

exports.getAllExposures = async (req, res) => {
  try {
    const data = await exposureService.getAllExposures();
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExposuresByApi = async (req, res) => {
  try {
    const { apiId } = req.params;
    const data = await exposureService.getExposuresByApi(apiId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPiiReport = async (req, res) => {
  try {
    const data = await exposureService.getPiiReport();
    res.status(200).json({ success: true, message: 'PII Report Generated', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.triggerAnalysis = async (req, res) => {
  try {
    // Allows admin to manually test a string against regex engine
    const results = await exposureService.triggerAnalysis(req.body);
    res.status(200).json({ success: true, findings: results });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};