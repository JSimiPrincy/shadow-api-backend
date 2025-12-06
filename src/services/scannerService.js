const ScanJob = require('../data-access/models/ScanJob');
const TargetApp = require('../data-access/models/TargetApp');
const coreScanner = require('../engine/coreScanner');
const browserManager = require('../engine/browserManager');

class ScannerService {
  
  // 1. Start Scan
  async startScan(targetId) {
    // Validate Target Exists
    const target = await TargetApp.findByPk(targetId);
    if (!target) throw new Error('Target not found');

    // Create Job Record
    const job = await ScanJob.create({
      targetId: target.id,
      status: 'PENDING'
    });

    // Trigger Async Scan (Don't await this, let it run in background)
    coreScanner.runScan(job.id, target.id);

    return job;
  }

  // 2. Stop Scan
  async stopScan(scanJobId) {
    const job = await ScanJob.findByPk(scanJobId);
    if (!job) throw new Error('Scan job not found');

    if (job.status !== 'RUNNING' && job.status !== 'PENDING') {
      throw new Error('Scan is not active');
    }

    // Kill Browser
    const stopped = await browserManager.closeBrowser(job.id);
    
    // Update DB
    job.status = 'STOPPED';
    job.endTime = new Date();
    await job.save();

    return { message: stopped ? 'Browser stopped successfully' : 'Scan marked stopped (Browser was not found)' };
  }

  // 3. Get Status
  async getStatus(targetId) {
    // Get the most recent job for this target
    const latestJob = await ScanJob.findOne({
      where: { targetId },
      order: [['createdAt', 'DESC']]
    });
    
    if (!latestJob) throw new Error('No scans found for this target');
    return latestJob;
  }

  // 4. Restart Scan
  async restartScan(targetId) {
    // Just a wrapper around start, but typically you might check for existing running jobs
    const activeJob = await ScanJob.findOne({
        where: { targetId, status: 'RUNNING' }
    });

    if (activeJob) {
        throw new Error('A scan is already running for this target');
    }

    return this.startScan(targetId);
  }
}

module.exports = new ScannerService();