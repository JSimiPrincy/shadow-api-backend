const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ScanJob = sequelize.define('ScanJob', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  targetId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'STOPPED'),
    defaultValue: 'PENDING',
  },
  logs: {
    type: DataTypes.TEXT, // Simple log storage for errors/info
    allowNull: true,
  },
  startTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = ScanJob;