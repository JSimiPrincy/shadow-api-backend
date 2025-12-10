const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const RiskScore = sequelize.define('RiskScore', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // Link to the API
  endpointId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true, // One risk record per API
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0, max: 100 }
  },
  severity: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    defaultValue: 'LOW',
  },
  // Store the JSON explanation of why the score is high
  riskFactors: {
    type: DataTypes.JSON, // Stores { unauthenticated: true, pii_count: 2 ... }
    allowNull: true,
  },
  lastCalculatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  timestamps: true,
});

module.exports = RiskScore;