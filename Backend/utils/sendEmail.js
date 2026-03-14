import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Resumewala" <${process.env.EMAIL_USER}>`,
      to:process.env.ADMIN_EMAIL,
      subject,
      html,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};