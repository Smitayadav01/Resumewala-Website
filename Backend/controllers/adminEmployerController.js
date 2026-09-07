import Employer from "../models/Employer.js";
import Payment from "../models/Payment.js";
import Job from "../models/job.js";
import { sendEmail } from "../utils/sendEmail.js";

// ─── Employers ────────────────────────────────────────────────
export const getAllEmployers = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status === "pending") { query.isApproved = false; query.isBlocked = false; }
    if (status === "approved") query.isApproved = true;
    if (status === "blocked") query.isBlocked = true;

    const total = await Employer.countDocuments(query);
    const employers = await Employer.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ employers, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const approveEmployer = async (req, res) => {
  try {
    const employer = await Employer.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, isBlocked: false },
      { new: true }
    ).select("-password");

    if (!employer) return res.status(404).json({ message: "Not found." });

    await sendEmail({
      to: employer.email,
      subject: "✅ Your Resumewala Employer Account is Approved!",
      html: `
        <h2>Account Approved!</h2>
        <p>Hi ${employer.recruiterName}, your employer account for
          <strong>${employer.companyName}</strong> has been approved.
          You can now login and post jobs.</p>
        <a href="${process.env.FRONTEND_URL}/employer/login"
          style="background:#16a34a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px;">
          Login Now
        </a>
      `,
    });

    res.json({ message: "Employer approved.", employer });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const blockEmployer = async (req, res) => {
  try {
    const employer = await Employer.findByIdAndUpdate(
      req.params.id,
      { isBlocked: req.body.block },
      { new: true }
    ).select("-password");

    if (!employer) return res.status(404).json({ message: "Not found." });
    res.json({ message: `Employer ${employer.isBlocked ? "blocked" : "unblocked"}.`, employer });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyEmployer = async (req, res) => {
  try {
    const employer = await Employer.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select("-password");

    if (!employer) return res.status(404).json({ message: "Not found." });

    await sendEmail({
      to: employer.email,
      subject: "🏅 Verified Badge Granted — Resumewala",
      html: `<h2>You're Verified!</h2><p>Hi ${employer.recruiterName}, your company
        <strong>${employer.companyName}</strong> has been granted the Verified Employer badge.</p>`,
    });

    res.json({ message: "Employer verified.", employer });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Payments ─────────────────────────────────────────────────
export const getAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = status ? { status } : {};
    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate("employer", "companyName email recruiterName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ payments, total });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Pending Employer Jobs ────────────────────────────────────
export const getPendingJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      postedBy: "employer",
      status: "pending",
      isAdminApproved: false,
    })
      .populate("employer", "companyName email recruiterName companyLogo")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Approve Employer Job ─────────────────────────────────────
export const approveJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: "employer" }, // ✅ only employer jobs
      {
        status: "approved",
        isAdminApproved: true,
        approvedAt: new Date(),
      },
      { new: true }
    ).populate("employer", "companyName email recruiterName");

    if (!job) return res.status(404).json({ message: "Employer job not found." });

    // Email employer
    if (job.employer?.email) {
      await sendEmail({
        to: job.employer.email,
        subject: `✅ Your job "${job.title}" is now live on Resumewala!`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#16a34a">Job Approved & Live! 🎉</h2>
            <p>Hi ${job.employer.recruiterName},</p>
            <p>Your job posting has been approved by our team and is now live on Resumewala.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Job Title</td>
                  <td style="padding:8px">${job.title}</td></tr>
              <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Company</td>
                  <td style="padding:8px">${job.employer.companyName}</td></tr>
              <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Status</td>
                  <td style="padding:8px;color:#16a34a"><strong>✅ Approved & Live</strong></td></tr>
              <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Approved On</td>
                  <td style="padding:8px">${new Date().toLocaleDateString("en-IN")}</td></tr>
            </table>
            <p>Candidates can now find and apply for your job.</p>
            <a href="${process.env.FRONTEND_URL}/employer/jobs"
              style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px;">
              View My Jobs
            </a>
          </div>
        `,
      });
    }

    res.json({ message: "Job approved and now live.", job });
  } catch (err) {
    console.error("approveJob error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Reject Employer Job ──────────────────────────────────────
export const rejectJob = async (req, res) => {
  try {
    const { reason } = req.body;

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: "employer" }, // ✅ only employer jobs
      {
        status: "rejected",
        isAdminApproved: false,
        rejectedAt: new Date(),
        rejectionReason: reason || "",
      },
      { new: true }
    ).populate("employer", "companyName email recruiterName");

    if (!job) return res.status(404).json({ message: "Employer job not found." });

    // Email employer
    if (job.employer?.email) {
      await sendEmail({
        to: job.employer.email,
        subject: `❌ Your job "${job.title}" was not approved`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#dc2626">Job Not Approved</h2>
            <p>Hi ${job.employer.recruiterName},</p>
            <p>Unfortunately your job posting for <strong>"${job.title}"</strong>
              at <strong>${job.employer.companyName}</strong> was not approved.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
            <p>Please review our posting guidelines and resubmit with complete information.</p>
            <a href="${process.env.FRONTEND_URL}/employer/jobs/new"
              style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px;">
              Post a New Job
            </a>
          </div>
        `,
      });
    }

    res.json({ message: "Job rejected.", job });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Admin Manual Plan Assignment ────────────────────────────
export const setEmployerPlan = async (req, res) => {
  try {
    const { plan, jobCredits, validityDays } = req.body;
    const validPlans = ["none", "basic", "standard", "premium"];
    if (!validPlans.includes(plan)) return res.status(400).json({ message: "Invalid plan." });

    const DEFAULTS= {
      none: { credits: 0, days: 0 },
      basic: { credits: 5, days: 30 },
      standard: { credits: 15, days: 60 },
      premium: { credits: 99999, days: 90 },
    };

    const credits = jobCredits ?? DEFAULTS[plan].credits;
    const days = validityDays ?? DEFAULTS[plan].days;
    const expiresAt = plan === "none" ? null : new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const employer = await Employer.findByIdAndUpdate(
      req.params.id,
      {
        subscription: {
          plan,
          jobCredits: credits,
          expiresAt,
          razorpayPaymentId: "admin-assigned",
          razorpayOrderId: "admin-assigned",
        },
      },
      { new: true }
    ).select("-password");

    if (!employer) return res.status(404).json({ message: "Not found." });

    if (plan !== "none") {
      await sendEmail({
        to: employer.email,
        subject: `🎁 ${plan.toUpperCase()} Plan Assigned by Resumewala`,
        html: `<h2>Subscription Assigned</h2><p>Hi ${employer.recruiterName}, you've been assigned
          the <strong>${plan.toUpperCase()} Plan</strong>.
          Credits: ${credits === 99999 ? "Unlimited" : credits}.
          Valid until: ${expiresAt?.toLocaleDateString("en-IN")}.</p>`,
      });
    }

    res.json({ message: `Plan set to ${plan}.`, employer });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};