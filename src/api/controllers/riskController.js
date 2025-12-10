const riskService = require('../../services/riskService');

exports.getAllRisks = async (req, res) => {
  try {
    const data = await riskService.getAllRisks();
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRiskByApi = async (req, res) => {
  try {
    const data = await riskService.getRiskByApi(req.params.apiId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.recalculateAll = async (req, res) => {
  try {
    const result = await riskService.recalculateAllRisks();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const summary = await riskService.getAttackSurfaceSummary();
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHeatmap = async (req, res) => {
  try {
    const data = await riskService.getHeatmapData();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};