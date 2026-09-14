import Employer from "../models/Employer.js";
import Payment from "../models/Payment.js";
import Job from "../models/job.js";
import { sendEmail } from "../utils/sendEmail.js";

export const getAllEmployers = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status === "pending") {
      query.isEmailVerified = true;
      query.isApproved = false;
      query.isRejected = false;
      query.isBlocked = false;
    }
    if (status === "unverified") {
      query.isEmailVerified = false;
    }
    if (status === "approved") query.isApproved = true;
    if (status === "rejected") query.isRejected = true;
    if (status === "blocked") query.isBlocked = true;

    const total = await Employer.countDocuments(query);
    const employers = await Employer.find(query)
      .select("-password -emailVerificationToken -resetPasswordToken")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ employers, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ── PATCH /api/admin/employers/:id/approve ────────────────────
export const approveEmployer = async (req, res) => {
  try {
    const employer = await Employer.findById(req.params.id);
    if (!employer) return res.status(404).json({ message: "Employer not found." });

    // ✅ Cannot approve if email not verified
    if (!employer.isEmailVerified) {
      return res.status(400).json({
        message: "Cannot approve this employer — their email is not yet verified.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    // ✅ Cannot approve a blocked employer without unblocking first
    if (employer.isBlocked) {
      return res.status(400).json({
        message: "Cannot approve a blocked employer. Please unblock first.",
      });
    }

    employer.isApproved = true;
    employer.isRejected = false;
    employer.rejectionReason = "";
    employer.rejectedAt = null;
    employer.approvedAt = new Date();
    await employer.save();

    await sendEmail({
      to: employer.email,
      subject: "✅ Your Resumewala Employer Account is Approved!",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#16a34a">Account Approved! 🎉</h2>
          <p>Hi ${employer.recruiterName},</p>
          <p>Great news! Your employer account for <strong>${employer.companyName}</strong>
            has been approved by our team.</p>
          <p>You can now login and start posting jobs.</p>
          <a href="${process.env.FRONTEND_URL}/employer/login"
            style="background:#16a34a;color:#fff;padding:12px 24px;border-radius:6px;
            text-decoration:none;display:inline-block;margin-top:12px;">
            Login to Dashboard
          </a>
          <p style="margin-top:16px;color:#666;font-size:13px">— Team Resumewala</p>
        </div>
      `,
    });

    res.json({
      message: "Employer approved. Approval email sent.",
      employer: { ...employer.toObject(), password: undefined },
    });
  } catch (err) {
    console.error("approveEmployer error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── PATCH /api/admin/employers/:id/reject ─────────────────────
export const rejectEmployer = async (req, res) => {
  try {
    const { reason } = req.body;
    const employer = await Employer.findById(req.params.id);
    if (!employer) return res.status(404).json({ message: "Employer not found." });

    employer.isApproved = false;
    employer.isRejected = true;
    employer.rejectionReason = reason || "Your application did not meet our requirements.";
    employer.rejectedAt = new Date();
    await employer.save();

    await sendEmail({
      to: employer.email,
      subject: "❌ Resumewala Employer Account Not Approved",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#dc2626">Account Not Approved</h2>
          <p>Hi ${employer.recruiterName},</p>
          <p>Unfortunately, your employer account for <strong>${employer.companyName}</strong>
            was not approved.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          <p>If you believe this is an error, please contact us at
            <a href="mailto:${process.env.ADMIN_EMAIL}">${process.env.ADMIN_EMAIL}</a>.</p>
          <p style="color:#666;font-size:13px">— Team Resumewala</p>
        </div>
      `,
    });

    res.json({ message: "Employer rejected. Notification email sent.", employer });
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
    res.json({ message: "Verified badge granted.", employer });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

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

export const getPendingJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: "employer", status: "pending", isAdminApproved: false })
      .populate("employer", "companyName email recruiterName companyLogo")
      .sort({ createdAt: -1 }).lean();
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const approveJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: "employer" },
      { status: "approved", isAdminApproved: true, approvedAt: new Date() },
      { new: true }
    ).populate("employer", "companyName email recruiterName");
    if (!job) return res.status(404).json({ message: "Employer job not found." });
    if (job.employer?.email) {
      await sendEmail({
        to: job.employer.email,
        subject: `✅ Your job "${job.title}" is now live!`,
        html: `<h2>Job Approved!</h2><p>Hi ${job.employer.recruiterName},
          your job <strong>${job.title}</strong> is now live on Resumewala.</p>
          <a href="${process.env.FRONTEND_URL}/employer/jobs">View My Jobs</a>`,
      });
    }
    res.json({ message: "Job approved and now live.", job });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const rejectJob = async (req, res) => {
  try {
    const { reason } = req.body;
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: "employer" },
      { status: "rejected", isAdminApproved: false, rejectedAt: new Date(), rejectionReason: reason || "" },
      { new: true }
    ).populate("employer", "companyName email recruiterName");
    if (!job) return res.status(404).json({ message: "Not found." });
    if (job.employer?.email) {
      await sendEmail({
        to: job.employer.email,
        subject: `❌ Your job "${job.title}" was not approved`,
        html: `<h2>Job Not Approved</h2><p>Hi ${job.employer.recruiterName},
          your job <strong>${job.title}</strong> was not approved.
          ${reason ? `<br/>Reason: ${reason}` : ""}</p>`,
      });
    }
    res.json({ message: "Job rejected.", job });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const setEmployerPlan = async (req, res) => {
  try {
    const { plan, jobCredits, validityDays } = req.body;
    const validPlans = ["none", "basic", "standard", "premium"];
    if (!validPlans.includes(plan)) return res.status(400).json({ message: "Invalid plan." });
    const DEFAULTS = {
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
      { subscription: { plan, jobCredits: credits, expiresAt, razorpayPaymentId: "admin-assigned", razorpayOrderId: "admin-assigned" } },
      { new: true }
    ).select("-password");
    if (!employer) return res.status(404).json({ message: "Not found." });
    res.json({ message: `Plan set to ${plan}.`, employer });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};