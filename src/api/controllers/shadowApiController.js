const shadowApiService = require('../../services/shadowApiService');

exports.getAll = async (req, res) => {
  try {
    const endpoints = await shadowApiService.getAllEndpoints();
    res.status(200).json({ success: true, count: endpoints.length, data: endpoints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const endpoint = await shadowApiService.getEndpointById(req.params.id);
    res.status(200).json({ success: true, data: endpoint });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.getByTarget = async (req, res) => {
  try {
    const endpoints = await shadowApiService.getEndpointsByTarget(req.params.targetId);
    res.status(200).json({ success: true, count: endpoints.length, data: endpoints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUnauthenticated = async (req, res) => {
  try {
    const endpoints = await shadowApiService.getUnauthenticatedEndpoints();
    res.status(200).json({ success: true, count: endpoints.length, data: endpoints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.classify = async (req, res) => {
  try {
    const stats = await shadowApiService.runClassification();
    res.status(200).json({ success: true, message: 'Classification Analysis Complete', data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};