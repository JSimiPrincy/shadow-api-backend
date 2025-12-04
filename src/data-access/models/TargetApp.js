const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const TargetApp = sequelize.define('TargetApp', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isUrl: true },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ACTIVE', 'ARCHIVED'),
    defaultValue: 'ACTIVE',
  },
  // We store credentials as an encrypted JSON string
  authConfig: {
    type: DataTypes.TEXT, // Will store encrypted JSON: { username, password, loginUrl }
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = TargetApp;