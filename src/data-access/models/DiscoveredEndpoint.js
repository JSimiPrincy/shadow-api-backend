const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const DiscoveredEndpoint = sequelize.define('DiscoveredEndpoint', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  targetId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  method: {
    type: DataTypes.STRING(10), // GET, POST, etc.
    allowNull: false,
  },
  url: {
    type: DataTypes.TEXT, // Full URL remains TEXT
    allowNull: false,
  },
  path: {
    // ⚠️ FIXED: Reduced to 500. 
    // Calculation: 500 chars * 4 bytes = 2000 bytes.
    // Total Index Size = 2000 (path) + 40 (method) + 36 (UUID) = ~2076 bytes (Safe < 3072)
    type: DataTypes.STRING(500), 
    allowNull: false,
  },
  resourceType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  statusCode: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isAuthenticated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  authType: {
    type: DataTypes.STRING,
    defaultValue: 'None',
  },
  isShadow: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  riskScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastDetectedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['targetId', 'method', 'path']
    }
  ]
});

module.exports = DiscoveredEndpoint;