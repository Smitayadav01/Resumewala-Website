import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,   // smtp.zoho.in
  port: process.env.SMTP_PORT,   // 465
  secure: true,                  // required for 465
  auth: {
    user: process.env.EMAIL_USER, // info@resumewala.co.in
    pass: process.env.EMAIL_PASS, // Zoho app password
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Resumewala" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};