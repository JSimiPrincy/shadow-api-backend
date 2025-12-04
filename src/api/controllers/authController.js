const authService = require('../../services/authService');

exports.register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    // req.token comes from authMiddleware
    await authService.logout(req.user.id, req.token);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error("Logout Error:", error); // 👈 Log specific error to console
    res.status(500).json({ success: false, message: 'Logout failed', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(403).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;
    const result = await authService.resetPassword(resetToken, password);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};