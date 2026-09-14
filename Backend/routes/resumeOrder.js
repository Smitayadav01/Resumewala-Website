import express from "express";
import multer from "multer";
import crypto from "crypto";
import Razorpay from "razorpay";

import ResumeOrder from "../models/ResumeOrder.js";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

/* =========================================================
   RAZORPAY
========================================================= */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/*
  IMPORTANT:
  ₹499 = 49900 paise

  Never take the price from the frontend.
*/
const RESUME_PRICE =100;
const RESUME_PACKAGE = "professional";
const PACKAGE_LABEL = "Professional Resume – ₹499";

/* =========================================================
   MULTER
========================================================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),

  filename: (req, file, cb) =>
    cb(
      null,
      `resume_${Date.now()}_${file.originalname.replace(/\s/g, "_")}`
    ),
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, DOCX allowed"));
    }
  },
});

/* =========================================================
   POST /api/resume/order
   STEP 1:
   Create DB order + Razorpay order
========================================================= */

router.post("/order", upload.single("resume"), async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      experience,
      targetRole,
      package: pkg,
      message,
    } = req.body;

    /* ---------------------------------------------
       Validate required fields
    --------------------------------------------- */

    if (!name || !email || !mobile || !targetRole) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing.",
      });
    }

    /* ---------------------------------------------
       IMPORTANT:
       Ignore frontend package/price.

       Since you now have ONE resume package,
       backend always uses Professional ₹499.
    --------------------------------------------- */

    const resumeFilename = req.file?.filename || "";

    /* ---------------------------------------------
       Create Razorpay order
    --------------------------------------------- */

    const razorpayOrder = await razorpay.orders.create({
      amount: RESUME_PRICE,
      currency: "INR",
      receipt: `resume_${Date.now()}`,
      notes: {
        service: "Professional Resume",
        customerName: name,
        customerEmail: email,
        targetRole,
      },
    });

    console.log("Razorpay resume order created:", razorpayOrder.id);

    /* ---------------------------------------------
       Save ResumeOrder in MongoDB
    --------------------------------------------- */

    const order = await ResumeOrder.create({
      name,
      email,
      mobile,
      experience,
      targetRole,

      // Always professional
      package: RESUME_PACKAGE,

      message,

      resumeFile: resumeFilename,

      // Amount stored in rupees in DB
      amount: 499,

      // Payment information
      paymentStatus: "pending",

      razorpayOrderId: razorpayOrder.id,

      status: "new",
    });

    /* ---------------------------------------------
       Return Razorpay details to frontend
    --------------------------------------------- */

    return res.status(201).json({
      success: true,

      message: "Resume order created.",

      orderId: order._id,

      razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,

        orderId: razorpayOrder.id,

        amount: RESUME_PRICE,

        currency: "INR",

        name: "Resumewala",

        description: "Professional Resume Service – ₹499",

        prefill: {
          name,
          email,
          contact: mobile,
        },
      },
    });
  } catch (err) {
    console.error("Resume order creation error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to create resume order. Please try again.",
    });
  }
});

/* =========================================================
   POST /api/resume/order/verify
   STEP 2:
   Verify Razorpay payment
========================================================= */

router.post("/order/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    /* ---------------------------------------------
       Validate payment data
    --------------------------------------------- */

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification data missing.",
      });
    }

    /* ---------------------------------------------
       Find our database order
    --------------------------------------------- */

    const order = await ResumeOrder.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Resume order not found.",
      });
    }

    /* ---------------------------------------------
       Prevent duplicate verification
    --------------------------------------------- */

    if (order.paymentStatus === "paid") {
      return res.json({
        success: true,
        message: "Payment already verified.",
        orderId: order._id,
      });
    }

    /* ---------------------------------------------
       Make sure Razorpay order belongs
       to this database order
    --------------------------------------------- */

    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay order.",
      });
    }

    /* ---------------------------------------------
       Generate Razorpay signature
    --------------------------------------------- */

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body)
      .digest("hex");

    /* ---------------------------------------------
       Compare signatures
    --------------------------------------------- */

    if (expectedSignature !== razorpay_signature) {
      console.error("Invalid Razorpay signature");

      return res.status(400).json({
        success: false,
        message: "Payment verification failed.",
      });
    }

    /* ---------------------------------------------
       Payment verified successfully
    --------------------------------------------- */

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = "paid";

    await order.save();

    console.log(
      `Resume payment successful: ${order._id}`
    );

    /* =================================================
       EMAIL TO ADMIN
    ================================================= */

    await sendEmail({
      to: process.env.ADMIN_EMAIL,

      subject: `💰 Paid Resume Order — ₹499 — ${order.name}`,

      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">

          <h2 style="color:#16a34a">
            💰 Resume Payment Received
          </h2>

          <p>
            A customer has successfully paid <strong>₹499</strong>
            for the Professional Resume service.
          </p>

          <table style="width:100%;border-collapse:collapse;margin:16px 0">

            <tr>
              <td style="padding:8px;background:#f3f4f6;font-weight:bold">
                Name
              </td>
              <td style="padding:8px">
                ${order.name}
              </td>
            </tr>

            <tr>
              <td style="padding:8px;background:#f3f4f6;font-weight:bold">
                Email
              </td>
              <td style="padding:8px">
                ${order.email}
              </td>
            </tr>

            <tr>
              <td style="padding:8px;background:#f3f4f6;font-weight:bold">
                Mobile
              </td>
              <td style="padding:8px">
                ${order.mobile}
              </td>
            </tr>

            <tr>
              <td style="padding:8px;background:#f3f4f6;font-weight:bold">
                Package
              </td>
              <td style="padding:8px">
                <strong>Professional Resume</strong>
              </td>
            </tr>

            <tr>
              <td style="padding:8px;background:#f3f4f6;font-weight:bold">
                Amount
              </td>
              <td style="padding:8px">
                <strong>₹499</strong>
              </td>
            </tr>

            <tr>
              <td style="padding:8px;background:#f3f4f6;font-weight:bold">
                Target Role
              </td>
              <td style="padding:8px">
                ${order.targetRole}
              </td>
            </tr>

            <tr>
              <td style="padding:8px;background:#f3f4f6;font-weight:bold">
                Order ID
              </td>
              <td style="padding:8px">
                #${order._id}
              </td>
            </tr>

            <tr>
              <td style="padding:8px;background:#f3f4f6;font-weight:bold">
                Razorpay Payment ID
              </td>
              <td style="padding:8px">
                ${razorpay_payment_id}
              </td>
            </tr>

          </table>

          <p style="color:#16a34a;font-weight:bold">
            ✅ Payment verified successfully.
          </p>

        </div>
      `,
    });

    /* =================================================
       EMAIL TO CUSTOMER
    ================================================= */

    await sendEmail({
      to: order.email,

      subject: "✅ Payment Successful — Resumewala",

      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">

          <h2 style="color:#16a34a">
            Payment Successful! 🎉
          </h2>

          <p>
            Hi ${order.name},
          </p>

          <p>
            Thank you for choosing
            <strong>Resumewala</strong>.
          </p>

          <p>
            Your payment of
            <strong>₹499</strong>
            for our
            <strong>Professional Resume</strong>
            service has been successfully received.
          </p>

          <div style="
            background:#eff6ff;
            border-left:4px solid #2563eb;
            padding:16px;
            margin:16px 0;
            border-radius:4px;
          ">

            <p style="
              margin:0;
              font-weight:bold;
              color:#1e40af;
            ">
              What happens next?
            </p>

            <ol style="
              margin:8px 0 0;
              color:#374151;
              padding-left:20px;
            ">

              <li>
                Our expert reviews your details and uploaded resume.
              </li>

              <li>
                We may contact you at
                <strong>${order.mobile}</strong>
                if additional information is required.
              </li>

              <li>
                Your professional ATS-optimised resume will be prepared.
              </li>

              <li>
                Your resume will be delivered within
                <strong>36–48 hours</strong>.
              </li>

            </ol>

          </div>

          <table style="
            width:100%;
            border-collapse:collapse;
            margin:16px 0;
          ">

            <tr>
              <td style="
                padding:8px;
                background:#f3f4f6;
                font-weight:bold;
                width:40%;
              ">
                Package
              </td>

              <td style="padding:8px">
                Professional Resume
              </td>
            </tr>

            <tr>
              <td style="
                padding:8px;
                background:#f3f4f6;
                font-weight:bold;
              ">
                Amount Paid
              </td>

              <td style="padding:8px">
                ₹499
              </td>
            </tr>

            <tr>
              <td style="
                padding:8px;
                background:#f3f4f6;
                font-weight:bold;
              ">
                Target Role
              </td>

              <td style="padding:8px">
                ${order.targetRole}
              </td>
            </tr>

            <tr>
              <td style="
                padding:8px;
                background:#f3f4f6;
                font-weight:bold;
              ">
                Order ID
              </td>

              <td style="padding:8px">
                #${order._id.toString().slice(-6).toUpperCase()}
              </td>
            </tr>

          </table>

          <p>
            Thank you for trusting Resumewala with your career.
          </p>

          <p style="
            color:#6b7280;
            font-size:13px;
            margin-top:20px;
          ">
            — Team Resumewala
          </p>

        </div>
      `,
    });

    /* ---------------------------------------------
       Return success
    --------------------------------------------- */

    return res.json({
      success: true,
      message: "Payment verified successfully.",
      orderId: order._id,
      paymentStatus: "paid",
    });

  } catch (err) {
    console.error("Resume payment verification error:", err);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed.",
    });
  }
});

/* =========================================================
   GET /api/resume/orders
   Admin
========================================================= */

router.get("/orders", async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = status ? { status } : {};

    const total = await ResumeOrder.countDocuments(query);

    const orders = await ResumeOrder.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      orders,
      total,
      page: Number(page),
    });
  } catch (err) {
    console.error("Get resume orders error:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

/* =========================================================
   PATCH /api/resume/orders/:id
   Admin
========================================================= */

router.patch("/orders/:id", async (req, res) => {
  try {
    const {
      status,
      adminNotes,
      paymentStatus,
    } = req.body;

    const order = await ResumeOrder.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNotes,
        paymentStatus,
      },
      {
        new: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    /* ---------------------------------------------
       Email candidate when resume is delivered
    --------------------------------------------- */

    if (status === "delivered") {
      await sendEmail({
        to: order.email,

        subject: "🎉 Your Resume is Ready — Resumewala",

        html: `
          <div style="
            font-family:Arial,sans-serif;
            max-width:600px;
            margin:0 auto;
            padding:20px;
          ">

            <h2 style="color:#16a34a">
              Your Resume is Ready! 🎉
            </h2>

            <p>
              Hi ${order.name},
            </p>

            <p>
              Your ATS-optimised resume for
              <strong>${order.targetRole}</strong>
              is complete and has been sent to this email address.
            </p>

            <p>
              If you don't see it, please check your spam folder
              or reply to this email.
            </p>

            <p>
              Good luck with your applications! 🍀
            </p>

            <p style="
              color:#6b7280;
              font-size:13px;
            ">
              — Team Resumewala
            </p>

          </div>
        `,
      });
    }

    res.json({
      message: "Order updated.",
      order,
    });

  } catch (err) {
    console.error("Update resume order error:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

export default router;





// import express from "express";
// import multer from "multer";
// import ResumeOrder from "../models/ResumeOrder.js";
// import { sendEmail } from "../utils/sendEmail.js";

// const router = express.Router();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/"),
//   filename: (req, file, cb) =>
//     cb(null, `resume_${Date.now()}_${file.originalname.replace(/\s/g, "_")}`),
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowed = [
//       "application/pdf",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     ];
//     allowed.includes(file.mimetype)
//       ? cb(null, true)
//       : cb(new Error("Only PDF, DOC, DOCX allowed"));
//   },
// });

// const PACKAGE_LABELS = {
//   basic: "Basic – ₹499",
//   professional: "Professional – ₹999",
//   linkedin: "LinkedIn Optimisation – ₹699",
// };

// const PACKAGE_AMOUNTS = {
//   basic: 499,
//   professional: 999,
//   linkedin: 699,
// };

// // ── POST /api/resume/order ────────────────────────────────────
// router.post("/order", upload.single("resume"), async (req, res) => {
//   try {
//     const {
//       name, email, mobile, experience,
//       targetRole, package: pkg, message,
//     } = req.body;

//     if (!name || !email || !mobile || !targetRole || !pkg) {
//       return res.status(400).json({ message: "Required fields missing." });
//     }

//     const packageLabel = PACKAGE_LABELS[pkg] || pkg;
//     const resumeFilename = req.file?.filename || "";

//     // Save to DB
//     const order = await ResumeOrder.create({
//       name, email, mobile, experience,
//       targetRole, package: pkg, message,
//       resumeFile: resumeFilename,
//       amount: PACKAGE_AMOUNTS[pkg] || 0,
//     });

//     const resumeInfo = req.file
//       ? `✅ Resume uploaded: ${req.file.originalname}`
//       : "❌ No resume uploaded";

//     // Email to Admin
//     await sendEmail({
//       to: process.env.ADMIN_EMAIL,
//       subject: `📄 New Resume Order — ${packageLabel} — ${name}`,
//       html: `
//         <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
//           <h2 style="color:#2563eb">New Resume Order #${order._id.toString().slice(-6).toUpperCase()}</h2>
//           <table style="width:100%;border-collapse:collapse;margin:16px 0">
//             <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold;width:35%">Name</td>
//                 <td style="padding:8px">${name}</td></tr>
//             <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Email</td>
//                 <td style="padding:8px">${email}</td></tr>
//             <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Mobile</td>
//                 <td style="padding:8px">${mobile}</td></tr>
//             <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Package</td>
//                 <td style="padding:8px"><strong style="color:#2563eb">${packageLabel}</strong></td></tr>
//             <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Experience</td>
//                 <td style="padding:8px">${experience || "Not specified"}</td></tr>
//             <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Target Role</td>
//                 <td style="padding:8px">${targetRole}</td></tr>
//             <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Resume</td>
//                 <td style="padding:8px">${resumeInfo}</td></tr>
//             <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Notes</td>
//                 <td style="padding:8px">${message || "None"}</td></tr>
//             <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Order ID</td>
//                 <td style="padding:8px">#${order._id}</td></tr>
//             <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Submitted</td>
//                 <td style="padding:8px">${new Date().toLocaleString("en-IN")}</td></tr>
//           </table>
//           <p style="color:#dc2626;font-weight:bold">
//             ⚡ Contact candidate within 2 hours at ${mobile}
//           </p>
//         </div>
//       `,
//     });

//     // Confirmation email to candidate
//     await sendEmail({
//       to: email,
//       subject: "✅ Resume Order Confirmed — Resumewala",
//       html: `
//         <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
//           <h2 style="color:#16a34a">Order Received! 🎉</h2>
//           <p>Hi ${name},</p>
//           <p>Thank you for choosing Resumewala Resume Writing Service.</p>
//           <p>Your order for <strong>${packageLabel}</strong> has been received.</p>
//           <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:16px;margin:16px 0;border-radius:4px">
//             <p style="margin:0;font-weight:bold;color:#1e40af">What happens next?</p>
//             <ol style="margin:8px 0 0;color:#374151;padding-left:20px">
//               <li>Our expert reviews your details</li>
//               <li>We contact you at <strong>${mobile}</strong> within <strong>2 hours</strong></li>
//               <li>Payment link shared after confirmation</li>
//               <li>Resume delivered within 36–48 hours after payment</li>
//             </ol>
//           </div>
//           <table style="width:100%;border-collapse:collapse;margin:16px 0">
//             <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold;width:40%">Package</td>
//                 <td style="padding:8px">${packageLabel}</td></tr>
//             <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Target Role</td>
//                 <td style="padding:8px">${targetRole}</td></tr>
//             <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold">Order ID</td>
//                 <td style="padding:8px">#${order._id.toString().slice(-6).toUpperCase()}</td></tr>
//           </table>
//           <p>Questions? WhatsApp us at
//             <a href="https://wa.me/91${process.env.WHATSAPP_NUMBER || 'XXXXXXXXXX'}">
//               +91 ${process.env.WHATSAPP_NUMBER || 'XXXXXXXXXX'}
//             </a>
//           </p>
//           <p style="color:#6b7280;font-size:13px;margin-top:20px">— Team Resumewala</p>
//         </div>
//       `,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Order submitted! We will contact you within 2 hours.",
//       orderId: order._id,
//     });
//   } catch (err) {
//     console.error("Resume order error:", err);
//     res.status(500).json({
//       message: "Failed to submit order. Please WhatsApp us directly.",
//     });
//   }
// });

// // ── GET /api/resume/orders — Admin only ──────────────────────
// router.get("/orders", async (req, res) => {
//   try {
//     const { status, page = 1, limit = 20 } = req.query;
//     const query = status ? { status } : {};
//     const total = await ResumeOrder.countDocuments(query);
//     const orders = await ResumeOrder.find(query)
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(Number(limit));
//     res.json({ orders, total, page: Number(page) });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ── PATCH /api/resume/orders/:id — Admin update status ───────
// router.patch("/orders/:id", async (req, res) => {
//   try {
//     const { status, adminNotes, paymentStatus } = req.body;
//     const order = await ResumeOrder.findByIdAndUpdate(
//       req.params.id,
//       { status, adminNotes, paymentStatus },
//       { new: true }
//     );
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     // Email candidate on delivery
//     if (status === "delivered") {
//       await sendEmail({
//         to: order.email,
//         subject: "🎉 Your Resume is Ready — Resumewala",
//         html: `
//           <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
//             <h2 style="color:#16a34a">Your Resume is Ready! 🎉</h2>
//             <p>Hi ${order.name},</p>
//             <p>Your ATS-optimised resume for <strong>${order.targetRole}</strong>
//               is complete and has been sent to this email address.</p>
//             <p>If you don't see it, please check your spam folder or reply to this email.</p>
//             <p>Good luck with your applications! 🍀</p>
//             <p style="color:#6b7280;font-size:13px">— Team Resumewala</p>
//           </div>
//         `,
//       });
//     }

//     res.json({ message: "Order updated.", order });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// export default router;