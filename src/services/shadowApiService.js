const DiscoveredEndpoint = require('../data-access/models/DiscoveredEndpoint');
const { Op } = require('sequelize');

class ShadowApiService {

  // 1. Ingest Traffic (Called by Puppeteer Engine)
  async registerEndpoint(data) {
    const { targetId, method, url, resourceType, statusCode, reqHeaders } = data;

    // Parse Path from URL to deduplicate (ignore query params for uniqueness)
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    // Simple Classification Heuristic
    let isAuthenticated = false;
    let authType = 'None';

    // Check Headers for common auth patterns
    const headers = reqHeaders || {};
    if (headers['authorization']) {
      isAuthenticated = true;
      authType = 'Bearer'; // Simplified
    } else if (headers['cookie'] && headers['cookie'].includes('session')) {
      // Very basic check, can be expanded
      isAuthenticated = true;
      authType = 'Cookie';
    } else if (headers['x-api-key']) {
      isAuthenticated = true;
      authType = 'API-Key';
    }

    try {
      // Upsert: Update if exists, Insert if new
      // We use 'findCreateFind' or 'upsert' depending on DB. 
      // Sequelize upsert is cleaner.
      const [endpoint, created] = await DiscoveredEndpoint.upsert({
        targetId,
        method,
        url, // Store full URL of most recent hit
        path,
        resourceType,
        statusCode,
        isAuthenticated,
        authType,
        lastDetectedAt: new Date()
      }, {
        conflictFields: ['targetId', 'method', 'path'] // Must match the index in Model
      });

      return endpoint;
    } catch (error) {
      console.error("Error registering endpoint:", error.message);
      // Don't crash the scanner if DB save fails
      return null;
    }
  }

  // 2. Get All
  async getAllEndpoints(filters = {}) {
    return await DiscoveredEndpoint.findAll({ where: filters });
  }

  // 3. Get By ID
  async getEndpointById(id) {
    const endpoint = await DiscoveredEndpoint.findByPk(id);
    if (!endpoint) throw new Error('Endpoint not found');
    return endpoint;
  }

  // 4. Get By Target
  async getEndpointsByTarget(targetId) {
    return await DiscoveredEndpoint.findAll({ 
      where: { targetId },
      order: [['lastDetectedAt', 'DESC']]
    });
  }

  // 5. Get Unauthenticated (High Risk)
  async getUnauthenticatedEndpoints() {
    return await DiscoveredEndpoint.findAll({
      where: { 
        isAuthenticated: false,
        // Optional: Filter out static assets if needed
        // path: { [Op.notLike]: '%.png' } 
      }
    });
  }

  // 6. Manual Classification Trigger (System)
  async runClassification() {
    // Re-analyzes all endpoints. 
    // In a real system, this might check against an OpenAPI spec to see if it's "Shadow" or "Documented".
    // For now, we count stats.
    const stats = await DiscoveredEndpoint.findAll({
        attributes: [
            'authType',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['authType']
    });
    return stats;
  }
}

// Need sequelize instance for the classification aggregation
const sequelize = require('../config/database');
module.exports = new ShadowApiService();