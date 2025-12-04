const TargetApp = require('../data-access/models/TargetApp');
const { encrypt } = require('../utils/crypto');

class TargetService {
  
  // 1. Register Target
  async createTarget(data) {
    // Check if URL already exists
    const exists = await TargetApp.findOne({ where: { url: data.url } });
    if (exists) {
      throw new Error('Target URL already registered');
    }
    return await TargetApp.create(data);
  }

  // 2. List All Targets
  async getAllTargets() {
    return await TargetApp.findAll({
      attributes: { exclude: ['authConfig'] } // Never return credentials in list
    });
  }

  // 3. Get Target Details
  async getTargetById(id) {
    const target = await TargetApp.findByPk(id, {
      attributes: { exclude: ['authConfig'] }
    });
    if (!target) throw new Error('Target not found');
    return target;
  }

  // 4. Update Target
  async updateTarget(id, data) {
    const target = await TargetApp.findByPk(id);
    if (!target) throw new Error('Target not found');
    
    // Prevent updating authConfig via this general update method
    if (data.authConfig) delete data.authConfig;

    return await target.update(data);
  }

  // 5. Remove Target
  async deleteTarget(id) {
    const target = await TargetApp.findByPk(id);
    if (!target) throw new Error('Target not found');
    await target.destroy();
    return true;
  }

  // 6. Store Credentials Securely
  async storeCredentials(id, credentials) {
    const target = await TargetApp.findByPk(id);
    if (!target) throw new Error('Target not found');

    // Convert object to string and encrypt
    const jsonString = JSON.stringify(credentials);
    const encryptedData = encrypt(jsonString);

    target.authConfig = encryptedData;
    await target.save();

    return { message: 'Credentials encrypted and stored successfully' };
  }
}

module.exports = new TargetService();