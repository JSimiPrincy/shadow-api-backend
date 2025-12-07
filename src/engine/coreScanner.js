const { launchBrowser, closeBrowser } = require('./browserManager');
const ScanJob = require('../data-access/models/ScanJob');
const TargetApp = require('../data-access/models/TargetApp');
const shadowApiService = require('../services/shadowApiService'); // <--- IMPORT THIS
const { decrypt } = require('../utils/crypto');

const runScan = async (scanJobId, targetId) => {
  let browser;
  try {
    await ScanJob.update({ status: 'RUNNING' }, { where: { id: scanJobId } });
    
    const target = await TargetApp.findByPk(targetId);
    if (!target) throw new Error('Target not found');

    browser = await launchBrowser(scanJobId);
    const page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', async (request) => {
      // Capture necessary data BEFORE continuing request
      const resourceType = request.resourceType();
      const method = request.method();
      const url = request.url();
      const headers = request.headers();

      request.continue();

      // Filter: Only care about API-like traffic (XHR, Fetch, Websockets)
      if (['xhr', 'fetch', 'websocket', 'document'].includes(resourceType)) {
        
        // Log to DB via Service
        // We do not await this to avoid slowing down the browser interaction
        shadowApiService.registerEndpoint({
            targetId: target.id,
            method,
            url,
            resourceType,
            statusCode: 200, // Request phase doesn't have status, updated in 'requestfinished' ideal
            reqHeaders: headers
        }).catch(err => console.error("DB Save Error", err.message));
        
        console.log(`[🔎 SAVED] ${method} ${url}`);
      }
    });

    // Handle Response to get Status Code
    page.on('requestfinished', async (request) => {
        const resourceType = request.resourceType();
        
        // Only analyze API-like responses
        if (['xhr', 'fetch'].includes(resourceType)) {
            try {
                const response = request.response();
                if (!response) return;

                // 1. Get the URL to match with our DB record
                const url = request.url();
                const method = request.method();
                const urlObj = new URL(url);
                const path = urlObj.pathname;

                // 2. Find the Endpoint ID (We just saved it in shadowApiService)
                // Note: In high traffic, this lookup might need caching. 
                const endpoint = await shadowApiService.registerEndpoint({
                     targetId, method, url, resourceType, statusCode: response.status()
                }); // Re-calling this ensures we have the ID

                if (endpoint) {
                    // 3. Capture Body
                    let body = '';
                    try {
                        // Buffer -> String
                        body = await response.text(); 
                    } catch (e) {
                        // Sometimes response body is not available (redirects, etc)
                    }

                    // 4. Send to Exposure Service
                    if (body) {
                        exposureService.analyzePayload(endpoint.id, body)
                            .catch(err => console.error("Exposure Analysis Error", err.message));
                    }
                }

            } catch (error) {
                console.error("Error processing response body:", error.message);
            }
        }
    });

    console.log(`[🚀 SCAN START] Navigating to ${target.url}`);
    
    // Auth Logic (Same as before)...
    if (target.authConfig) { /* ... */ }

    await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Scroll Logic (Same as before)...
    await page.evaluate(async () => { /* ... */ });

    await closeBrowser(scanJobId);
    await ScanJob.update({ status: 'COMPLETED', endTime: new Date() }, { where: { id: scanJobId } });
    console.log(`[✅ SCAN COMPLETE] Job ${scanJobId}`);

  } catch (error) {
    console.error(`[❌ SCAN FAILED]`, error);
    await closeBrowser(scanJobId);
    await ScanJob.update({ status: 'FAILED', logs: error.message, endTime: new Date() }, { where: { id: scanJobId } });
  }
};

module.exports = { runScan };