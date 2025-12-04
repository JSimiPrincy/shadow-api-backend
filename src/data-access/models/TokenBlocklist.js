const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const TokenBlocklist = sequelize.define('TokenBlocklist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE, // We can auto-delete rows after this date via cron/job
    allowNull: false,
  }
}, {
  timestamps: true,
});

module.exports = TokenBlocklist;