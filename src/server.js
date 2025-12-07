const app = require('./app');
const sequelize = require('./config/database');
require('dotenv').config();

// ⬇️ IMPORT MODELS HERE TO ENSURE TABLES ARE CREATED ⬇️
const User = require('./data-access/models/User');
const TokenBlocklist = require('./data-access/models/TokenBlocklist');
const TargetApp = require('./data-access/models/TargetApp');
const ScanJob = require('./data-access/models/ScanJob');
const DiscoveredEndpoint = require('./data-access/models/DiscoveredEndpoint');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to DB
    await sequelize.authenticate();
    console.log('✅ Database connected.');
    
    // Sync models (Creates missing tables like TokenBlocklist)
    // alter: true updates tables if you changed columns
    await sequelize.sync({ alter: true }); 
    console.log('✅ Models synced (Tables created).');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

startServer();