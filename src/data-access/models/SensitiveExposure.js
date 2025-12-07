const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const SensitiveExposure = sequelize.define('SensitiveExposure', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // Link to the API Endpoint where this was found
  endpointId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  // Type of PII (EMAIL, CREDIT_CARD, etc.)
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  severity: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    defaultValue: 'LOW',
  },
  // Store a snippet of the data (masked ideally)
  sampleData: {
    type: DataTypes.STRING, 
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('OPEN', 'RESOLVED', 'FALSE_POSITIVE'),
    defaultValue: 'OPEN',
  }
}, {
  timestamps: true,
});

module.exports = SensitiveExposure;