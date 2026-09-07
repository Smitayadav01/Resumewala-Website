const cron = require('node-cron');
const Application = require('../models/Application');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const { sendEmail } = require('../utils/sendEmail');
const { emailTemplates } = require('../utils/emailTemplates');

// Runs every day at 8:00 PM IST (14:30 UTC)
const startDailySummaryCron = () => {
  cron.schedule('30 14 * * *', async () => {
    console.log('[CRON] Running daily application summary...');
    try {
      const since = new Date();
      since.setHours(0, 0, 0, 0);

      // Get all employers with approved status
      const employers = await Employer.find({ isApproved: true, isBlocked: false });

      for (const employer of employers) {
        try {
          // Get today's applications for this employer
          const applications = await Application.find({
            employer: employer._id,
            appliedAt: { $gte: since },
          }).populate('job', 'jobTitle');

          // Only send if there are applications OR employer has active jobs
          const activeJobs = await Job.countDocuments({ employer: employer._id, status: 'Active' });
          if (applications.length === 0 && activeJobs === 0) continue;

          const appList = applications.map(a => ({
            candidateName: a.candidateName,
            jobTitle: a.job?.jobTitle || 'N/A',
          }));

          await sendEmail({
            to: employer.email,
            subject: `Daily Summary – ${applications.length} new application${applications.length !== 1 ? 's' : ''} today`,
            html: emailTemplates.dailySummary(
              employer.recruiterName,
              new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
              appList
            ),
          });

          console.log(`[CRON] Summary sent to ${employer.email}`);
        } catch (innerErr) {
          console.error(`[CRON] Failed to send to ${employer.email}:`, innerErr.message);
        }
      }

      console.log('[CRON] Daily summary complete.');
    } catch (err) {
      console.error('[CRON] Daily summary failed:', err);
    }
  }, { timezone: 'Asia/Kolkata' });

  console.log('[CRON] Daily summary cron scheduled.');
};

// Auto-close expired jobs — runs every day at midnight IST
const startJobExpiryCheck = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Checking for expired jobs...');
    try {
      const result = await Job.updateMany(
        { status: 'Active', jobExpiryDate: { $lt: new Date() } },
        { $set: { status: 'Closed' } }
      );
      console.log(`[CRON] Closed ${result.modifiedCount} expired jobs.`);
    } catch (err) {
      console.error('[CRON] Job expiry check failed:', err);
    }
  }, { timezone: 'Asia/Kolkata' });

  console.log('[CRON] Job expiry cron scheduled.');
};

module.exports = { startDailySummaryCron, startJobExpiryCheck };