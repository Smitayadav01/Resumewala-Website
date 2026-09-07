import Application from "../models/Application.js";
import Employer from "../models/Employer.js";
import { sendEmail } from "../utils/sendEmail.js";

export const sendDailySummary = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employers = await Employer.find({ isApproved: true, isBlocked: false });

    for (const employer of employers) {
      const applications = await Application.find({
        employer: employer._id,
        appliedAt: { $gte: yesterday, $lt: today },
      }).populate("job", "title");

      if (applications.length === 0) continue;

      const rows = applications
        .map((a) => `<tr><td>${a.candidateName}</td><td>${a.job?.title || "N/A"}</td><td>${a.status}</td></tr>`)
        .join("");

      await sendEmail({
        to: employer.email,
        subject: `Daily Summary: ${applications.length} new application(s) received`,
        html: `
          <h2>Daily Application Summary</h2>
          <p>Hi ${employer.recruiterName}, here is your summary for ${yesterday.toDateString()}:</p>
          <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%">
            <thead><tr><th>Candidate</th><th>Job</th><th>Status</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <p><a href="${process.env.FRONTEND_URL}/employer/dashboard">View Dashboard</a></p>
        `,
      });
    }
    console.log("[Daily Summary] Emails sent.");
  } catch (err) {
    console.error("[Daily Summary] Error:", err);
  }
};