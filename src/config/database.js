const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306, // Added port support
    dialect: process.env.DB_DIALECT,   // Will now read 'mysql' from .env
    logging: false,
  }
);

module.exports = sequelize;