import express from "express";
import multer from "multer";
import crypto from "crypto";
import Razorpay from "razorpay";
import ResumeOrder from "../models/ResumeOrder.js";
import { sendEmail } from "../utils/sendEmail.js";
import cloudinary from "../config/cloudinary.js";   // ✅ reuse existing config
import axios from "axios";

const router = express.Router();

// ✅ Use memory storage — file stays as buffer, no disk write
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExt = [".pdf", ".doc", ".docx"];
    const hasType = allowed.includes(file.mimetype);
    const hasExt = allowedExt.some((e) =>
      file.originalname.toLowerCase().endsWith(e)
    );
    if (hasType || hasExt) cb(null, true);
    else cb(new Error("Only PDF, DOC, DOCX allowed"));
  },
});

const RESUME_PRICE_PAISE = 9900; // ₹99 in paise
const RESUME_PRICE_INR = 99;

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PACKAGE_LABELS = {
  basic: "Basic – ₹1",
  professional: "Fresher / Early-Career Resume – ₹1",
  linkedin: "LinkedIn Optimisation – ₹1",
};

// ✅ Helper — upload buffer to Cloudinary as a raw file
const uploadResumeOrderFileToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "resume-orders",
        public_id: `${Date.now()}_${filename.replace(/\.[^/.]+$/, "")}`, // strip extension, cloudinary adds it
        use_filename: true,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// ────────────────────────────────────────────────────────────────
// POST /api/resume/order
// ────────────────────────────────────────────────────────────────
router.post("/order", upload.single("resume"), async (req, res) => {
  try {
    const {
      name, email, mobile, experience,
      targetRole, package: pkg, message,
    } = req.body;

    if (!name || !email || !mobile || !targetRole) {
      return res.status(400).json({
        success: false,
        message: "Name, email, mobile, and target role are required.",
      });
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit Indian mobile number.",
      });
    }

    // ✅ Upload resume to Cloudinary if provided
    let resumeUrl = "";
    let resumePublicId = "";
    let resumeFileName = "";

    if (req.file) {
      try {
        const result = await uploadResumeOrderFileToCloudinary(
          req.file.buffer,
          req.file.originalname
        );
        resumeUrl = result.secure_url;
        resumePublicId = result.public_id;
        resumeFileName = req.file.originalname;
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr);
        return res.status(500).json({
          success: false,
          message: "Failed to upload resume file. Please try again.",
        });
      }
    }

    const order = await ResumeOrder.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      experience: experience || "",
      targetRole: targetRole.trim(),
      package: pkg || "professional",
      message: message || "",
      resumeUrl,
      resumePublicId,
      resumeFileName,
      amount: RESUME_PRICE_INR,
      paymentStatus: "pending",
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: RESUME_PRICE_PAISE,
      currency: "INR",
      receipt: `resume_${order._id.toString().slice(-8)}_${Date.now()}`,
      notes: {
        orderId: order._id.toString(),
        customerName: name.trim(),
        customerEmail: email.trim(),
        targetRole: targetRole.trim(),
      },
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(201).json({
      success: true,
      message: "Order created. Complete payment to confirm.",
      orderId: order._id.toString(),
      razorpay: {
        orderId: razorpayOrder.id,
        keyId: process.env.RAZORPAY_KEY_ID,
        amount: RESUME_PRICE_PAISE,
        currency: "INR",
        name: "Resumewala",
        description: "Fresher / Early-Career Resume Writing Service",
      },
    });
  } catch (err) {
    console.error("Resume order create error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to create order. Please try again.",
    });
  }
});

// ────────────────────────────────────────────────────────────────
// POST /api/resume/order/verify
// ────────────────────────────────────────────────────────────────
router.post("/order/verify", async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification fields.",
      });
    }

    const order = await ResumeOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.paymentStatus === "paid") {
      return res.json({ success: true, message: "Order already verified." });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = "failed";
      await order.save();
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed. Contact support.",
      });
    }

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = "paid";
    await order.save();

    const packageLabel = PACKAGE_LABELS[order.package] || order.package;

    if (process.env.ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `💳 Resume Order Paid — ₹${order.amount} — ${order.name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:#16a34a">New Paid Resume Order 🎉</h2>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold;width:35%">Order ID</td>
                  <td style="padding:8px">#${order._id.toString().slice(-6).toUpperCase()}</td></tr>
              <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Name</td>
                  <td style="padding:8px">${order.name}</td></tr>
              <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Email</td>
                  <td style="padding:8px">${order.email}</td></tr>
              <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Mobile</td>
                  <td style="padding:8px">${order.mobile}</td></tr>
              <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Experience</td>
                  <td style="padding:8px">${order.experience || "Not specified"}</td></tr>
              <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Target Role</td>
                  <td style="padding:8px">${order.targetRole}</td></tr>
              <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Amount Paid</td>
                  <td style="padding:8px"><strong style="color:#16a34a">₹${order.amount}</strong></td></tr>
              <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Payment ID</td>
                  <td style="padding:8px;font-family:monospace">${razorpay_payment_id}</td></tr>
              <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Resume File</td>
                  <td style="padding:8px">${
                    order.resumeUrl
                      ? `<a href="${order.resumeUrl}" target="_blank">${order.resumeFileName || "View resume"}</a>`
                      : "Not uploaded"
                  }</td></tr>
              <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Notes</td>
                  <td style="padding:8px">${order.message || "None"}</td></tr>
            </table>
            <p style="color:#dc2626;font-weight:bold">
              ⚡ Start working on this order. Deliver within 36–48 hours.
            </p>
          </div>
        `,
      }).catch((e) => console.error("Admin email failed:", e));
    }

    await sendEmail({
      to: order.email,
      subject: "✅ Payment Confirmed — Your Resume Order is Placed!",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#16a34a">Order Confirmed! 🎉</h2>
          <p>Hi ${order.name},</p>
          <p>Your payment of <strong>₹${order.amount}</strong> has been received and your
            resume order is confirmed.</p>
          <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:16px;margin:16px 0;border-radius:4px">
            <p style="margin:0;font-weight:bold;color:#1e40af">What happens next?</p>
            <ol style="margin:8px 0 0;color:#374151;padding-left:20px">
              <li>Our expert reviews your details and target role</li>
              <li>We write your ATS-optimised resume from scratch</li>
              <li>Your resume is delivered to this email within <strong>36–48 hours</strong></li>
              <li>You get 2 free revisions if needed</li>
            </ol>
          </div>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold;width:40%">Order ID</td>
                <td style="padding:8px">#${order._id.toString().slice(-6).toUpperCase()}</td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Target Role</td>
                <td style="padding:8px">${order.targetRole}</td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Amount Paid</td>
                <td style="padding:8px">₹${order.amount}</td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Payment ID</td>
                <td style="padding:8px;font-family:monospace;font-size:12px">${razorpay_payment_id}</td></tr>
          </table>
          <p>Questions? WhatsApp us at
            <a href="https://wa.me/91${process.env.WHATSAPP_NUMBER || '7506836835'}">
              +91 ${process.env.WHATSAPP_NUMBER || '7506836835'}
            </a>
          </p>
          <p style="color:#6b7280;font-size:13px;margin-top:20px">— Team Resumewala</p>
        </div>
      `,
    }).catch((e) => console.error("Customer email failed:", e));

    res.json({
      success: true,
      message: "Payment verified. Order confirmed! Check your email for details.",
      orderId: order._id.toString(),
    });
  } catch (err) {
    console.error("Resume verify error:", err);
    res.status(500).json({
      success: false,
      message: "Verification failed. Please contact support with your payment ID.",
    });
  }
});

// ────────────────────────────────────────────────────────────────
// GET /api/resume/orders — Admin
// ────────────────────────────────────────────────────────────────
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

// ────────────────────────────────────────────────────────────────
// PATCH /api/resume/orders/:id — Admin
// ────────────────────────────────────────────────────────────────
router.patch("/orders/:id", async (req, res) => {
  try {
    const { status, adminNotes, paymentStatus } = req.body;
    const update = {};
    if (status) update.status = status;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const order = await ResumeOrder.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (status === "delivered") {
      await sendEmail({
        to: order.email,
        subject: "🎉 Your Resume is Ready — Resumewala",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:#16a34a">Your Resume is Ready! 🎉</h2>
            <p>Hi ${order.name},</p>
            <p>Your ATS-optimised resume for <strong>${order.targetRole}</strong> is complete.</p>
            <p>Please check this email for the attached resume file. If you don't see
              it, check your spam folder or WhatsApp us.</p>
            <p>You have <strong>2 free revisions</strong> — just reply to this email
              with what you'd like changed.</p>
            <p>Good luck with your applications! 🍀</p>
            <p style="color:#6b7280;font-size:13px">— Team Resumewala</p>
          </div>
        `,
      }).catch((e) => console.error("Delivery email failed:", e));
    }

    res.json({ message: "Order updated.", order });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// ────────────────────────────────────────────────────────────────
// GET /api/resume/orders/:id/view-resume — Admin only
// Streams the resume file through OUR backend using authenticated
// Cloudinary access, bypassing any public delivery restrictions.
// ────────────────────────────────────────────────────────────────
router.get("/orders/:id/view-resume", async (req, res) => {
  try {
    const order = await ResumeOrder.findById(req.params.id);
    if (!order || !order.resumePublicId) {
      return res.status(404).json({ message: "Resume not found." });
    }

    // Generate a signed, time-limited URL using our Cloudinary credentials
    const signedUrl = cloudinary.url(order.resumePublicId, {
      resource_type: "raw",
      type: "upload",
      sign_url: true,
      secure: true,
    });

    // Fetch the file server-side (authenticated request, not public delivery)
    const response = await axios.get(signedUrl, {
      responseType: "arraybuffer",
    });

    const safeFileName = encodeURIComponent(order.resumeFileName || "resume.pdf");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${safeFileName}`);
    res.send(Buffer.from(response.data));
  } catch (err) {
    console.error("Resume order view error:", err.message);
    if (err.response?.status === 401) {
      return res.status(401).json({ message: "Cloudinary access denied. Check API credentials." });
    }
    res.status(500).json({ message: "Failed to load resume." });
  }
});

export default router;