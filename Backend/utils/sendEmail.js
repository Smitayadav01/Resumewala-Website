import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
-
export const sendEmail = async ({ to, subject, html }) => {
  try {

    // If sending to admin, split multiple emails
   const recipients =
  to === "ADMIN"
    ? process.env.ADMIN_EMAIL.split(",").map(e => e.trim())
    : to;

    const info = await transporter.sendMail({
      from: `"Resumewala" <${process.env.EMAIL_USER}>`,
      to: recipients,
      subject,
      html,
    });

    console.log("Email sent:", info.response);

  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};