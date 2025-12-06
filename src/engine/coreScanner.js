const { launchBrowser, closeBrowser } = require('./browserManager');
const ScanJob = require('../data-access/models/ScanJob');
const TargetApp = require('../data-access/models/TargetApp');
const { decrypt } = require('../utils/crypto');

const runScan = async (scanJobId, targetId) => {
  let browser;
  try {
    // 1. Update Job Status
    await ScanJob.update({ status: 'RUNNING' }, { where: { id: scanJobId } });
    
    // 2. Fetch Target Details
    const target = await TargetApp.findByPk(targetId);
    if (!target) throw new Error('Target not found');

    // 3. Launch Browser
    browser = await launchBrowser(scanJobId);
    const page = await browser.newPage();

    // 4. NETWORK INTERCEPTION (The "Shadow API" Discovery Magic)
    // We intercept every request the frontend makes
    await page.setRequestInterception(true);

    page.on('request', (request) => {
      // Allow the request to continue
      request.continue();
      
      // TODO (Module 4): Here we will analyze `request.url()`, `request.method()`
      // and send it to the Discovery Engine.
      if (['xhr', 'fetch', 'websocket'].includes(request.resourceType())) {
        console.log(`[🔎 TRAFFIC CAPTURED] ${request.method()} ${request.url()}`);
      }
    });

    // 5. Navigate to Target
    console.log(`[🚀 SCAN START] Navigating to ${target.url}`);
    
    // Check for Credentials (Login Simulation) - Basic Implementation
    if (target.authConfig) {
        try {
            const creds = JSON.parse(decrypt(target.authConfig));
            // Note: Login logic is highly specific to the app. 
            // Ideally, you'd navigate to creds.loginUrl, type in fields, and click submit.
            // For now, we navigate to the main URL.
        } catch (e) {
            console.error("Failed to decrypt credentials");
        }
    }

    // Go to the page and wait for network idle (page fully loaded)
    await page.goto(target.url, { waitUntil: 'networkidle2', timeout: 60000 });

    // 6. Simulate Interaction (Scroll to trigger lazy loaded APIs)
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });

    // 7. Cleanup
    await closeBrowser(scanJobId);
    await ScanJob.update({ status: 'COMPLETED', endTime: new Date() }, { where: { id: scanJobId } });
    console.log(`[✅ SCAN COMPLETE] Job ${scanJobId}`);

  } catch (error) {
    console.error(`[❌ SCAN FAILED]`, error);
    await closeBrowser(scanJobId); // Ensure cleanup
    await ScanJob.update({ 
      status: 'FAILED', 
      logs: error.message, 
      endTime: new Date() 
    }, { where: { id: scanJobId } });
  }
};

module.exports = { runScan };