const RiskScore = require('../data-access/models/RiskScore');
const DiscoveredEndpoint = require('../data-access/models/DiscoveredEndpoint');
const SensitiveExposure = require('../data-access/models/SensitiveExposure');
const { calculateRiskScore } = require('../utils/riskCalculators');
const sequelize = require('../config/database');

class RiskService {

  // 1. Calculate Risk for ONE Endpoint
  async calculateRiskForEndpoint(endpointId) {
    const endpoint = await DiscoveredEndpoint.findByPk(endpointId);
    if (!endpoint) return null;

    const exposures = await SensitiveExposure.findAll({ where: { endpointId } });
    
    // Run Math Logic
    const { score, severity, factors } = calculateRiskScore(endpoint, exposures);

    // Update RiskScore Table (Detail)
    // using upsert to handle create or update
    await RiskScore.upsert({
      endpointId,
      score,
      severity,
      riskFactors: factors,
      lastCalculatedAt: new Date()
    });

    // Update Main Endpoint Table (Quick Access)
    endpoint.riskScore = score;
    await endpoint.save();

    return { score, severity, factors };
  }

  // 2. Recalculate ALL (Bulk Operation)
  async recalculateAllRisks() {
    const endpoints = await DiscoveredEndpoint.findAll();
    let processed = 0;

    for (const endpoint of endpoints) {
      await this.calculateRiskForEndpoint(endpoint.id);
      processed++;
    }
    return { message: `Recalculated risks for ${processed} APIs` };
  }

  // 3. Get Risk Details
  async getRiskByApi(apiId) {
    return await RiskScore.findOne({ 
      where: { endpointId: apiId },
      include: [{ model: DiscoveredEndpoint, attributes: ['method', 'path'] }]
    });
  }

  // 4. Attack Surface Summary (Stats)
  async getAttackSurfaceSummary() {
    // Count APIs by Severity
    const severityCounts = await RiskScore.findAll({
      attributes: ['severity', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['severity']
    });

    // Count Auth vs Unauth
    const authCounts = await DiscoveredEndpoint.findAll({
        attributes: ['isAuthenticated', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['isAuthenticated']
    });

    return {
        severity: severityCounts,
        authentication: authCounts
    };
  }

  // 5. Heatmap Data
  // Returns x (Auth Type), y (Severity), value (count)
  async getHeatmapData() {
    // This complex query groups by AuthType AND Risk Severity
    // Note: requires associations to be set correctly
    const data = await sequelize.query(`
      SELECT 
        e.authType, 
        r.severity, 
        COUNT(*) as count 
      FROM DiscoveredEndpoints e
      JOIN RiskScores r ON e.id = r.endpointId
      GROUP BY e.authType, r.severity
    `, { type: sequelize.QueryTypes.SELECT });

    return data;
  }
  
  // 6. Get All Risks (List View)
  async getAllRisks() {
      return await RiskScore.findAll({
          order: [['score', 'DESC']],
          include: [{ model: DiscoveredEndpoint, attributes: ['method', 'path', 'url'] }]
      });
  }
}

module.exports = new RiskService();