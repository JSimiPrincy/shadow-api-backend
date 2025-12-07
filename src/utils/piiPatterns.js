const patterns = {
    EMAIL: {
        regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        name: 'Email Address',
        severity: 'MEDIUM'
    },
    CREDIT_CARD: {
        // Basic pattern for Visa/Mastercard (16 digits)
        regex: /\b(?:\d{4}[- ]?){3}\d{4}\b/g,
        name: 'Credit Card Number',
        severity: 'CRITICAL'
    },
    SSN: {
        // US SSN pattern
        regex: /\b\d{3}-\d{2}-\d{4}\b/g,
        name: 'Social Security Number',
        severity: 'CRITICAL'
    },
    API_KEY: {
        // Generic high-entropy strings often used as keys
        regex: /(:i)(api_key|apikey|access_token|secret)[=:]\s*["']?([a-zA-Z0-9_\-]{16,})["']?/g,
        name: 'Potential API Key',
        severity: 'HIGH'
    },
    PHONE: {
        regex: /\b\+?[1-9]\d{1,14}\b/g,
        name: 'Phone Number',
        severity: 'LOW'
    }
};

const scanText = (text) => {
    const findings = [];
    
    if (!text || typeof text !== 'string') return findings;

    Object.keys(patterns).forEach(key => {
        const pattern = patterns[key];
        const matches = text.match(pattern.regex);
        if (matches) {
            // Deduplicate matches
            const uniqueMatches = [...new Set(matches)];
            uniqueMatches.forEach(match => {
                findings.push({
                    type: key,
                    name: pattern.name,
                    severity: pattern.severity,
                    sample: match // In prod, you might want to redact this (e.g., ****-1234)
                });
            });
        }
    });

    return findings;
};

module.exports = { scanText };