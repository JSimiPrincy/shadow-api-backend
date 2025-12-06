const puppeteer = require('puppeteer');

// In-memory storage for active browser instances
// Map<scanJobId, browserInstance>
const activeScans = new Map();

const launchBrowser = async (scanJobId) => {
  const browser = await puppeteer.launch({
    headless: "new", // Run in background
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
  });
  
  activeScans.set(scanJobId, browser);
  return browser;
};

const closeBrowser = async (scanJobId) => {
  const browser = activeScans.get(scanJobId);
  if (browser) {
    await browser.close();
    activeScans.delete(scanJobId);
    return true;
  }
  return false;
};

module.exports = { launchBrowser, closeBrowser };