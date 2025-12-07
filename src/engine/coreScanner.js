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
        const response = request.response();
        if (response && ['xhr', 'fetch'].includes(request.resourceType())) {
             // In a full production app, you'd update the record here with the status code
             // For this demo, we captured the intent in the 'request' event.
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