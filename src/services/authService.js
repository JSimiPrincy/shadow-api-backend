const User = require('../data-access/models/User');
const TokenBlocklist = require('../data-access/models/TokenBlocklist');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwtHelpers');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // 👈 THIS IS REQUIRED FOR RESET PASSWORD
const { Op } = require('sequelize');

class AuthService {
  
  // 1. REGISTER
  async register(userData) {
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new Error('Email already in use');
    }
    
    const newUser = await User.create(userData);
    
    const userResponse = newUser.toJSON();
    delete userResponse.password;
    
    return userResponse;
  }

  // 2. LOGIN
  async login(email, password) {
    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid credentials');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return { 
      user: { id: user.id, email: user.email, role: user.role },
      accessToken, 
      refreshToken 
    };
  }

  // 3. LOGOUT
  async logout(userId, token) {
    if (!token) return false;

    // Decode to get expiration
    const decoded = jwt.decode(token);
    
    // Create Blocklist Entry
    await TokenBlocklist.create({
      token: token,
      expiresAt: new Date(decoded.exp * 1000)
    });

    // Remove refresh token
    const user = await User.findByPk(userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    return true;
  }

  // 4. REFRESH TOKEN
  async refresh(token) {
    if (!token) throw new Error('No token provided');

    try {
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      
      const user = await User.findByPk(decoded.id);
      if (!user || user.refreshToken !== token) {
        throw new Error('Invalid refresh token');
      }

      const newAccessToken = generateAccessToken(user);
      return { accessToken: newAccessToken };

    } catch (error) {
      throw new Error('Token expired or invalid');
    }
  }

  // 5. FORGOT PASSWORD
  async forgotPassword(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('There is no user with that email');
    }

    // This method is defined in the User Model (User.js)
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Return token for testing (In prod, email this)
    return { resetToken, message: 'Reset token generated' };
  }

  // 6. RESET PASSWORD
  async resetPassword(token, newPassword) {
    // Hash the token from the URL to match the one in DB
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [Op.gt]: Date.now() } // Ensure not expired
      }
    });

    if (!user) {
      throw new Error('Invalid or expired token');
    }

    // Set new password (Model hook will hash it)
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    
    await user.save();

    return { message: 'Password updated successfully' };
  }
}

module.exports = new AuthService();