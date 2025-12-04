const targetService = require('../../services/targetService');

exports.createTarget = async (req, res) => {
  try {
    const target = await targetService.createTarget(req.body);
    res.status(201).json({ success: true, data: target });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllTargets = async (req, res) => {
  try {
    const targets = await targetService.getAllTargets();
    res.status(200).json({ success: true, count: targets.length, data: targets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTargetById = async (req, res) => {
  try {
    const target = await targetService.getTargetById(req.params.id);
    res.status(200).json({ success: true, data: target });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.updateTarget = async (req, res) => {
  try {
    const target = await targetService.updateTarget(req.params.id, req.body);
    res.status(200).json({ success: true, data: target });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteTarget = async (req, res) => {
  try {
    await targetService.deleteTarget(req.params.id);
    res.status(200).json({ success: true, message: 'Target removed successfully' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.storeCredentials = async (req, res) => {
  try {
    // Expecting body: { username, password, loginUrl }
    await targetService.storeCredentials(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Credentials secured' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};