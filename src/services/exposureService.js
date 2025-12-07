const SensitiveExposure = require('../data-access/models/SensitiveExposure');
const DiscoveredEndpoint = require('../data-access/models/DiscoveredEndpoint');
const { scanText } = require('../utils/piiPatterns');

class ExposureService {

  /**
   * Analyzes a payload (response body) for PII.
   * This is called by the Scanner Engine in real-time.
   */
  async analyzePayload(endpointId, payloadString) {
    if (!payloadString) return;

    // 1. Run Regex Scanner
    const findings = scanText(payloadString);

    // 2. Save findings to DB
    for (const finding of findings) {
      // Check if we already logged this specific exposure for this endpoint
      // (Prevent flooding DB with the same credit card 100 times)
      const exists = await SensitiveExposure.findOne({
        where: {
          endpointId,
          type: finding.type,
          sampleData: finding.sample
        }
      });

      if (!exists) {
        await SensitiveExposure.create({
          endpointId,
          type: finding.type,
          severity: finding.severity,
          sampleData: finding.sample
        });
        console.log(`[⚠️ EXPOSURE DETECTED] ${finding.name} found in API ${endpointId}`);
      }
    }
    
    return findings;
  }

  // 1. List all exposures
  async getAllExposures() {
    return await SensitiveExposure.findAll({
      include: [{ model: DiscoveredEndpoint, attributes: ['method', 'path', 'url'] }],
      order: [['createdAt', 'DESC']]
    });
  }

  // 2. Get exposures for specific API
  async getExposuresByApi(apiId) {
    return await SensitiveExposure.findAll({
      where: { endpointId: apiId }
    });
  }

  // 3. PII Report (Grouped by severity)
  async getPiiReport() {
    const exposures = await SensitiveExposure.findAll({
        attributes: ['type', 'severity', 'status'],
        include: [{ model: DiscoveredEndpoint, attributes: ['method', 'path'] }]
    });
    return exposures;
  }

  // 4. Trigger Analysis (Manual simulation)
  // Since we don't store full body history, this is mostly for testing or re-scanning if we add body storage later.
  async triggerAnalysis(data) {
    const { endpointId, samplePayload } = data;
    return await this.analyzePayload(endpointId, samplePayload);
  }
}

module.exports = new ExposureService();