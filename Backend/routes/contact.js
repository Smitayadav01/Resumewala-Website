import express from "express";
import { sendEmail } from "../utils/sendEmail.js";
import {
  contactAdminTemplate,
  contactUserTemplate
} from "../utils/emailTemplates.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {

    const { name, email, subject, message, type } = req.body;

    // 📩 Send to ADMIN
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form: ${subject}`,
      html: contactAdminTemplate({ name, email, subject, message, type })
    });

    // 📩 Send confirmation to USER
    await sendEmail({
      to: email,
      subject: "We received your message - Resumewala",
      html: contactUserTemplate(name)
    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully"
    });

  } catch (error) {
    console.error("Contact form error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send message"
    });
  }
});

export default router;