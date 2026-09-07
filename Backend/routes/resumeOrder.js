import express from "express";
import multer from "multer";
import ResumeOrder from "../models/ResumeOrder.js";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `resume_${Date.now()}_${file.originalname.replace(/\s/g, "_")}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only PDF, DOC, DOCX allowed"));
  },
});

const PACKAGE_LABELS = {
  basic: "Basic – ₹499",
  professional: "Professional – ₹999",
  linkedin: "LinkedIn Optimisation – ₹699",
};

const PACKAGE_AMOUNTS = {
  basic: 499,
  professional: 999,
  linkedin: 699,
};

// ── POST /api/resume/order ────────────────────────────────────
router.post("/order", upload.single("resume"), async (req, res) => {
  try {
    const {
      name, email, mobile, experience,
      targetRole, package: pkg, message,
    } = req.body;

    if (!name || !email || !mobile || !targetRole || !pkg) {
      return res.status(400).json({ message: "Required fields missing." });
    }

    const packageLabel = PACKAGE_LABELS[pkg] || pkg;
    const resumeFilename = req.file?.filename || "";

    // Save to DB
    const order = await ResumeOrder.create({
      name, email, mobile, experience,
      targetRole, package: pkg, message,
      resumeFile: resumeFilename,
      amount: PACKAGE_AMOUNTS[pkg] || 0,
    });

    const resumeInfo = req.file
      ? `✅ Resume uploaded: ${req.file.originalname}`
      : "❌ No resume uploaded";

    // Email to Admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `📄 New Resume Order — ${packageLabel} — ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#2563eb">New Resume Order #${order._id.toString().slice(-6).toUpperCase()}</h2>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold;width:35%">Name</td>
                <td style="padding:8px">${name}</td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Email</td>
                <td style="padding:8px">${email}</td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Mobile</td>
                <td style="padding:8px">${mobile}</td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Package</td>
                <td style="padding:8px"><strong style="color:#2563eb">${packageLabel}</strong></td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Experience</td>
                <td style="padding:8px">${experience || "Not specified"}</td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Target Role</td>
                <td style="padding:8px">${targetRole}</td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Resume</td>
                <td style="padding:8px">${resumeInfo}</td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Notes</td>
                <td style="padding:8px">${message || "None"}</td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Order ID</td>
                <td style="padding:8px">#${order._id}</td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Submitted</td>
                <td style="padding:8px">${new Date().toLocaleString("en-IN")}</td></tr>
          </table>
          <p style="color:#dc2626;font-weight:bold">
            ⚡ Contact candidate within 2 hours at ${mobile}
          </p>
        </div>
      `,
    });

    // Confirmation email to candidate
    await sendEmail({
      to: email,
      subject: "✅ Resume Order Confirmed — Resumewala",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#16a34a">Order Received! 🎉</h2>
          <p>Hi ${name},</p>
          <p>Thank you for choosing Resumewala Resume Writing Service.</p>
          <p>Your order for <strong>${packageLabel}</strong> has been received.</p>
          <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:16px;margin:16px 0;border-radius:4px">
            <p style="margin:0;font-weight:bold;color:#1e40af">What happens next?</p>
            <ol style="margin:8px 0 0;color:#374151;padding-left:20px">
              <li>Our expert reviews your details</li>
              <li>We contact you at <strong>${mobile}</strong> within <strong>2 hours</strong></li>
              <li>Payment link shared after confirmation</li>
              <li>Resume delivered within 36–48 hours after payment</li>
            </ol>
          </div>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold;width:40%">Package</td>
                <td style="padding:8px">${packageLabel}</td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Target Role</td>
                <td style="padding:8px">${targetRole}</td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Order ID</td>
                <td style="padding:8px">#${order._id.toString().slice(-6).toUpperCase()}</td></tr>
          </table>
          <p>Questions? WhatsApp us at
            <a href="https://wa.me/91${process.env.WHATSAPP_NUMBER || 'XXXXXXXXXX'}">
              +91 ${process.env.WHATSAPP_NUMBER || 'XXXXXXXXXX'}
            </a>
          </p>
          <p style="color:#6b7280;font-size:13px;margin-top:20px">— Team Resumewala</p>
        </div>
      `,
    });

    res.status(201).json({
      success: true,
      message: "Order submitted! We will contact you within 2 hours.",
      orderId: order._id,
    });
  } catch (err) {
    console.error("Resume order error:", err);
    res.status(500).json({
      message: "Failed to submit order. Please WhatsApp us directly.",
    });
  }
});

// ── GET /api/resume/orders — Admin only ──────────────────────
router.get("/orders", async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const total = await ResumeOrder.countDocuments(query);
    const orders = await ResumeOrder.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ orders, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── PATCH /api/resume/orders/:id — Admin update status ───────
router.patch("/orders/:id", async (req, res) => {
  try {
    const { status, adminNotes, paymentStatus } = req.body;
    const order = await ResumeOrder.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes, paymentStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Email candidate on delivery
    if (status === "delivered") {
      await sendEmail({
        to: order.email,
        subject: "🎉 Your Resume is Ready — Resumewala",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:#16a34a">Your Resume is Ready! 🎉</h2>
            <p>Hi ${order.name},</p>
            <p>Your ATS-optimised resume for <strong>${order.targetRole}</strong>
              is complete and has been sent to this email address.</p>
            <p>If you don't see it, please check your spam folder or reply to this email.</p>
            <p>Good luck with your applications! 🍀</p>
            <p style="color:#6b7280;font-size:13px">— Team Resumewala</p>
          </div>
        `,
      });
    }

    res.json({ message: "Order updated.", order });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;