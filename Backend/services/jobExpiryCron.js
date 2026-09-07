import Job from "../models/job.js";
import Employer from "../models/Employer.js";
import { sendEmail } from "../utils/sendEmail.js";

export const expireOldJobs = async () => {
  try {
    const now = new Date();

    // Find all active jobs that have passed their expiry date
    const expiredJobs = await Job.find({
      status: "Active",
      expiryDate: { $lt: now },
      expiryDate: { $exists: true, $ne: null },
    }).lean();

    if (expiredJobs.length === 0) {
      console.log("[Job Expiry] No jobs to expire.");
      return;
    }

    const ids = expiredJobs.map((j) => j._id);

    // Bulk update to Closed
    await Job.updateMany(
      { _id: { $in: ids } },
      { status: "Closed" }
    );

    console.log(`[Job Expiry] Closed ${expiredJobs.length} expired jobs.`);

    // Notify each employer whose job expired
    for (const job of expiredJobs) {
      try {
        if (!job.employer) continue;
        const employer = await Employer.findById(job.employer).lean();
        if (!employer?.email) continue;

        await sendEmail({
          to: employer.email,
          subject: `Your job "${job.title}" has expired`,
          html: `
            <h2>Job Listing Expired</h2>
            <p>Hi ${employer.recruiterName},</p>
            <p>Your job posting <strong>"${job.title}"</strong> has expired as of
              ${new Date(job.expiryDate).toLocaleDateString("en-IN")}.
            </p>
            <p>It has been automatically closed and is no longer visible to candidates.</p>
            <p>You can re-post the job from your dashboard.</p>
            <a href="${process.env.FRONTEND_URL}/employer/jobs"
              style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px;">
              Go to My Jobs
            </a>
          `,
        });
      } catch (emailErr) {
        console.error(`[Job Expiry] Email failed for job ${job._id}:`, emailErr);
      }
    }
  } catch (err) {
    console.error("[Job Expiry] Error:", err);
  }
};