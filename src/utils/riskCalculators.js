/**
 * Calculates a Risk Score (0-100) based on weighted factors.
 * @param {Object} endpoint - The API endpoint object
 * @param {Array} exposures - List of sensitive data exposures for this API
 */
const calculateRiskScore = (endpoint, exposures) => {
  let score = 0;
  const factors = {};

  // 1. Authentication Check (High Impact: 40 pts)
  if (!endpoint.isAuthenticated) {
    score += 40;
    factors.unauthenticated = true;
  }

  // 2. Sensitive Data Exposure (High Impact: up to 40 pts)
  if (exposures && exposures.length > 0) {
    const piiScore = Math.min(exposures.length * 15, 40); // 15 pts per leak, max 40
    score += piiScore;
    factors.sensitiveData = { count: exposures.length, score: piiScore };
  }

  // 3. HTTP Method Risk (Medium Impact: 10 pts)
  // State-changing methods are riskier than GET
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(endpoint.method.toUpperCase())) {
    score += 10;
    factors.riskyMethod = endpoint.method;
  }

  // 4. Shadow API Status (Low Impact: 10 pts)
  // If it's unknown/undocumented
  if (endpoint.isShadow) {
    score += 10;
    factors.isShadow = true;
  }

  // Cap Score at 100
  score = Math.min(score, 100);

  // Determine Severity Label
  let severity = 'LOW';
  if (score >= 80) severity = 'CRITICAL';
  else if (score >= 50) severity = 'HIGH';
  else if (score >= 20) severity = 'MEDIUM';

  return { score, severity, factors };
};

module.exports = { calculateRiskScore };