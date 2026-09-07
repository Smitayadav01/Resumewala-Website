// ─── Welcome Email ────────────────────────────────────────────
export const welcomeTemplate = (name) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
    <h2 style="color:#2563eb">Welcome to Resumewala, ${name}! 🎉</h2>
    <p>Thank you for joining Resumewala — India's Smart Job Portal.</p>
    <p>You can now upload your resume and get discovered by top employers.</p>
    <a href="${process.env.FRONTEND_URL || 'https://resumewala.co.in'}/upload"
      style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px">
      Upload Resume Now
    </a>
    <p style="margin-top:20px;color:#666;font-size:13px">— Team Resumewala</p>
  </div>
`;

// ─── Email Verification ───────────────────────────────────────
export const verifyEmailTemplate = (name, url) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
    <h2 style="color:#2563eb">Verify Your Email</h2>
    <p>Hi ${name}, please click the button below to verify your email address.</p>
    <a href="${url}"
      style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px">
      Verify Email
    </a>
    <p style="margin-top:16px;color:#666;font-size:13px">
      Link expires in 24 hours. If you didn't create an account, ignore this email.
    </p>
  </div>
`;

// ─── Reset Password ───────────────────────────────────────────
export const resetPasswordTemplate = (name, url) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
    <h2 style="color:#2563eb">Reset Your Password</h2>
    <p>Hi ${name}, click the button below to reset your password.</p>
    <a href="${url}"
      style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px">
      Reset Password
    </a>
    <p style="margin-top:16px;color:#666;font-size:13px">
      This link expires in 15 minutes. If you didn't request a reset, ignore this email.
    </p>
  </div>
`;

// ─── Admin Notification ───────────────────────────────────────
export const adminNotificationTemplate = (user) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
    <h2 style="color:#2563eb">🚀 New User Registered</h2>
    <table style="width:100%;border-collapse:collapse;margin-top:16px">
      <tr>
        <td style="padding:8px;background:#f3f4f6;font-weight:bold;width:30%">Name</td>
        <td style="padding:8px">${user.fullName}</td>
      </tr>
      <tr>
        <td style="padding:8px;background:#f3f4f6;font-weight:bold">Email</td>
        <td style="padding:8px">${user.email}</td>
      </tr>
      <tr>
        <td style="padding:8px;background:#f3f4f6;font-weight:bold">Mobile</td>
        <td style="padding:8px">${user.mobileNumber || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding:8px;background:#f3f4f6;font-weight:bold">Registered At</td>
        <td style="padding:8px">${new Date().toLocaleString('en-IN')}</td>
      </tr>
    </table>
  </div>
`;

// ─── Job Applied — User Confirmation ─────────────────────────
export const jobAppliedUserTemplate = (name, jobTitle, company) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
    <h2 style="color:#16a34a">✅ Application Submitted!</h2>
    <p>Hi ${name},</p>
    <p>Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong>
      has been submitted successfully.</p>
    <p>The employer will review your profile and get back to you. Good luck! 🍀</p>
    <a href="${process.env.FRONTEND_URL || 'https://resumewala.co.in'}/jobs"
      style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px">
      Browse More Jobs
    </a>
    <p style="margin-top:20px;color:#666;font-size:13px">— Team Resumewala</p>
  </div>
`;

// ─── Job Applied — Admin Notification ────────────────────────
export const jobAppliedAdminTemplate = (candidateName, candidateEmail, jobTitle, company) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
    <h2 style="color:#2563eb">📋 New Job Application</h2>
    <table style="width:100%;border-collapse:collapse;margin-top:16px">
      <tr>
        <td style="padding:8px;background:#f3f4f6;font-weight:bold;width:30%">Candidate</td>
        <td style="padding:8px">${candidateName}</td>
      </tr>
      <tr>
        <td style="padding:8px;background:#f3f4f6;font-weight:bold">Email</td>
        <td style="padding:8px">${candidateEmail}</td>
      </tr>
      <tr>
        <td style="padding:8px;background:#f3f4f6;font-weight:bold">Job Title</td>
        <td style="padding:8px">${jobTitle}</td>
      </tr>
      <tr>
        <td style="padding:8px;background:#f3f4f6;font-weight:bold">Company</td>
        <td style="padding:8px">${company}</td>
      </tr>
      <tr>
        <td style="padding:8px;background:#f3f4f6;font-weight:bold">Applied At</td>
        <td style="padding:8px">${new Date().toLocaleString('en-IN')}</td>
      </tr>
    </table>
  </div>
`;






// export const welcomeTemplate = (name) => {
//   return `
//   <div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
//     <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
//       <tr>
//         <td align="center">
//           <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:40px;box-shadow:0 8px 24px rgba(0,0,0,0.05);">

//             <!-- Logo / Brand -->
//             <tr>
//               <td align="center" style="padding-bottom:20px;">
//                 <h1 style="margin:0;color:#111827;">Resumewala</h1>
//                 <p style="margin:5px 0 0;font-size:14px;color:#6b7280;">
//                   Upload Your Resume Once. <br/>
//                   <strong>Get Discovered by Employers.</strong>
//                 </p>
//               </td>
//             </tr>

//             <!-- Welcome Text -->
//             <tr>
//               <td style="padding-top:20px;">
//                 <h2 style="color:#4f46e5;margin-bottom:10px;">
//                   Welcome, ${name}! 🎉
//                 </h2>

//                 <p style="color:#374151;font-size:15px;line-height:1.6;">
//                   Your account has been successfully created.
//                   You're now one step closer to getting discovered by verified employers.
//                 </p>

//                 <p style="color:#374151;font-size:15px;line-height:1.6;">
//                   Upload your resume once and let employers find you —
//                   no more applying again and again.
//                 </p>
//               </td>
//             </tr>

//             <!-- CTA Button -->
//             <tr>
//               <td align="center" style="padding:30px 0;">
//                 <a href="https://resumewala.co.in"
//                    style="background:#4f46e5;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
//                    Upload Resume Now
//                 </a>
//               </td>
//             </tr>

//             <!-- Footer -->
//             <tr>
//               <td style="border-top:1px solid #e5e7eb;padding-top:20px;text-align:center;font-size:12px;color:#9ca3af;">
//                 © ${new Date().getFullYear()} Resumewala. All rights reserved.
//                 <br/>
//                 Helping job seekers connect with verified employers.
//               </td>
//             </tr>

//           </table>
//         </td>
//       </tr>
//     </table>
//   </div>
//   `;
// };    

// export const verifyEmailTemplate = (name, verifyUrl) => {
//   return `
//   <div style="background:#f3f4f6;padding:40px;font-family:Arial;">
//     <table width="600" align="center" style="background:#ffffff;padding:40px;border-radius:12px;">
      
//       <tr>
//         <td align="center">
//           <h1 style="margin:0;color:#111827;">Resumewala</h1>
//           <p style="color:#6b7280;font-size:14px;">
//             Upload Your Resume Once. Get Discovered by Employers.
//           </p>
//         </td>
//       </tr>

//       <tr>
//         <td style="padding-top:30px;">
//           <h2 style="color:#10b981;">Verify Your Email Address</h2>
//           <p style="color:#374151;">
//             Hi ${name},
//           </p>
//           <p style="color:#374151;">
//             Please confirm your email address to activate your Resumewala account.
//           </p>
//         </td>
//       </tr>

//       <tr>
//         <td align="center" style="padding:30px 0;">
//           <a href="${verifyUrl}"
//              style="background:#10b981;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;">
//              Verify Email
//           </a>
//         </td>
//       </tr>

//       <tr>
//         <td style="font-size:12px;color:#9ca3af;text-align:center;">
//           This link expires in 24 hours.
//         </td>
//       </tr>

//     </table>
//   </div>
//   `;
// };

// export const resetPasswordTemplate = (name, resetUrl) => {
//   return `
//   <div style="background:#f3f4f6;padding:40px;font-family:Arial;">
//     <table width="600" align="center" style="background:#ffffff;padding:40px;border-radius:12px;">

//       <tr>
//         <td align="center">
//           <h1 style="margin:0;color:#111827;">Resumewala</h1>
//           <p style="color:#6b7280;font-size:14px;">
//             Upload Your Resume Once. Get Discovered by Employers.
//           </p>
//         </td>
//       </tr>

//       <tr>
//         <td style="padding-top:30px;">
//           <h2 style="color:#ef4444;">Reset Your Password</h2>
//           <p style="color:#374151;">
//             Hello ${name},
//           </p>
//           <p style="color:#374151;">
//             We received a request to reset your password.
//             Click the button below to set a new password.
//           </p>
//         </td>
//       </tr>

//       <tr>
//         <td align="center" style="padding:30px 0;">
//           <a href="${resetUrl}"
//              style="background:#ef4444;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;">
//              Reset Password
//           </a>
//         </td>
//       </tr>

//       <tr>
//         <td style="font-size:12px;color:#9ca3af;text-align:center;">
//           This link expires in 15 minutes.
//         </td>
//       </tr>

//     </table>
//   </div>
//   `;
// };

// export const adminNotificationTemplate = (user) => {
//   return `
//   <div style="background:#f3f4f6;padding:40px;font-family:Arial;">
//     <table width="600" align="center" style="background:#ffffff;padding:40px;border-radius:12px;">

//       <tr>
//         <td align="center">
//           <h2 style="margin:0;color:#111827;">🚀 New User Registered</h2>
//         </td>
//       </tr>

//       <tr>
//         <td style="padding-top:20px;color:#374151;font-size:15px;">
//           <p><strong>Name:</strong> ${user.fullName}</p>
//           <p><strong>Email:</strong> ${user.email}</p>
//           <p><strong>Mobile:</strong> ${user.mobileNumber}</p>
//         </td>
//       </tr>

//       <tr>
//         <td style="padding-top:30px;font-size:12px;color:#9ca3af;text-align:center;">
//           Resumewala Admin Notification
//         </td>
//       </tr>

//     </table>
//   </div>
//   `;
// };

// // ✅ Email to USER — confirmation of their application
// export const jobAppliedUserTemplate = (name, jobTitle, company) => {
//   return `
//   <div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
//     <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
//       <tr>
//         <td align="center">
//           <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:40px;box-shadow:0 8px 24px rgba(0,0,0,0.05);">

//             <!-- Logo / Brand -->
//             <tr>
//               <td align="center" style="padding-bottom:20px;">
//                 <h1 style="margin:0;color:#111827;">Resumewala</h1>
//                 <p style="margin:5px 0 0;font-size:14px;color:#6b7280;">
//                   Upload Your Resume Once. <br/>
//                   <strong>Get Discovered by Employers.</strong>
//                 </p>
//               </td>
//             </tr>

//             <!-- Application Confirmed -->
//             <tr>
//               <td style="padding-top:20px;">
//                 <h2 style="color:#4f46e5;margin-bottom:10px;">
//                   Application Submitted! 🎉
//                 </h2>
//                 <p style="color:#374151;font-size:15px;line-height:1.6;">
//                   Hi <strong>${name}</strong>, your application has been successfully submitted. Here's a summary:
//                 </p>

//                 <!-- Job Info Box -->
//                 <table width="100%" cellpadding="0" cellspacing="0"
//                   style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0;">
//                   <tr>
//                     <td style="padding:8px 16px;">
//                       <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Job Title</p>
//                       <p style="margin:4px 0 0;font-size:16px;font-weight:bold;color:#111827;">${jobTitle}</p>
//                     </td>
//                   </tr>
//                   <tr>
//                     <td style="padding:8px 16px;">
//                       <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Company</p>
//                       <p style="margin:4px 0 0;font-size:16px;font-weight:bold;color:#4f46e5;">${company}</p>
//                     </td>
//                   </tr>
//                 </table>

//                 <p style="color:#374151;font-size:15px;line-height:1.6;">
//                   The employer will review your profile and resume. We'll keep you updated on next steps.
//                 </p>
//               </td>
//             </tr>

//             <!-- CTA -->
//             <tr>
//               <td align="center" style="padding:30px 0;">
//                 <a href="https://resumewala.co.in"
//                    style="background:#4f46e5;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
//                    View More Jobs
//                 </a>
//               </td>
//             </tr>

//             <!-- Footer -->
//             <tr>
//               <td style="border-top:1px solid #e5e7eb;padding-top:20px;text-align:center;font-size:12px;color:#9ca3af;">
//                 © ${new Date().getFullYear()} Resumewala. All rights reserved.
//                 <br/>
//                 Helping job seekers connect with verified employers.
//               </td>
//             </tr>

//           </table>
//         </td>
//       </tr>
//     </table>
//   </div>
//   `;
// };


// // ✅ Email to ADMIN — new application notification
// export const jobAppliedAdminTemplate = (candidateName, candidateEmail, jobTitle, company) => {
//   return `
//   <div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
//     <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
//       <tr>
//         <td align="center">
//           <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:40px;box-shadow:0 8px 24px rgba(0,0,0,0.05);">

//             <!-- Logo / Brand -->
//             <tr>
//               <td align="center" style="padding-bottom:20px;">
//                 <h1 style="margin:0;color:#111827;">Resumewala</h1>
//                 <p style="margin:5px 0 0;font-size:14px;color:#6b7280;">Admin Notification</p>
//               </td>
//             </tr>

//             <!-- Notification -->
//             <tr>
//               <td style="padding-top:20px;">
//                 <h2 style="color:#4f46e5;margin-bottom:10px;">
//                   📋 New Job Application Received
//                 </h2>
//                 <p style="color:#374151;font-size:15px;line-height:1.6;">
//                   A candidate has just applied for a job on Resumewala.
//                 </p>

//                 <!-- Info Box -->
//                 <table width="100%" cellpadding="0" cellspacing="0"
//                   style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0;">
//                   <tr>
//                     <td style="padding:8px 16px;">
//                       <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Candidate Name</p>
//                       <p style="margin:4px 0 0;font-size:16px;font-weight:bold;color:#111827;">${candidateName}</p>
//                     </td>
//                   </tr>
//                   <tr>
//                     <td style="padding:8px 16px;">
//                       <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Candidate Email</p>
//                       <p style="margin:4px 0 0;font-size:16px;font-weight:bold;color:#4f46e5;">${candidateEmail}</p>
//                     </td>
//                   </tr>
//                   <tr>
//                     <td style="padding:8px 16px;">
//                       <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Job Title</p>
//                       <p style="margin:4px 0 0;font-size:16px;font-weight:bold;color:#111827;">${jobTitle}</p>
//                     </td>
//                   </tr>
//                   <tr>
//                     <td style="padding:8px 16px;">
//                       <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Company</p>
//                       <p style="margin:4px 0 0;font-size:16px;font-weight:bold;color:#111827;">${company}</p>
//                     </td>
//                   </tr>
//                 </table>
//               </td>
//             </tr>

//             <!-- Footer -->
//             <tr>
//               <td style="border-top:1px solid #e5e7eb;padding-top:20px;text-align:center;font-size:12px;color:#9ca3af;">
//                 © ${new Date().getFullYear()} Resumewala. All rights reserved.
//               </td>
//             </tr>

//           </table>
//         </td>
//       </tr>
//     </table>
//   </div>
//   `;
// };


export const contactAdminTemplate = (data) => {
  const { name, email, subject, message, type } = data;

  return `
  <div style="background:#f3f4f6;padding:40px;font-family:Arial;">
    <table width="600" align="center" style="background:#ffffff;padding:40px;border-radius:12px;">

      <tr>
        <td align="center">
          <h2 style="margin:0;color:#111827;">📩 New Contact Form Submission</h2>
        </td>
      </tr>

      <tr>
        <td style="padding-top:20px;color:#374151;font-size:15px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Inquiry Type:</strong> ${type}</p>
          <p><strong>Subject:</strong> ${subject}</p>
        </td>
      </tr>

      <tr>
        <td style="padding-top:20px;">
          <p style="font-weight:bold;">Message:</p>
          <p style="color:#374151;">${message}</p>
        </td>
      </tr>

      <tr>
        <td style="padding-top:30px;font-size:12px;color:#9ca3af;text-align:center;">
          Resumewala Contact Form Notification
        </td>
      </tr>

    </table>
  </div>
  `;
};


export const contactUserTemplate = (name) => {
  return `
  <div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0"
            style="background:#ffffff;border-radius:12px;padding:40px;">

            <tr>
              <td align="center">
                <h1 style="margin:0;color:#111827;">Resumewala</h1>
                <p style="font-size:14px;color:#6b7280;">
                  Upload Your Resume Once. Get Discovered by Employers.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding-top:30px;">
                <h2 style="color:#4f46e5;">We Received Your Message 👍</h2>

                <p style="color:#374151;font-size:15px;">
                  Hi <strong>${name}</strong>,
                </p>

                <p style="color:#374151;font-size:15px;">
                  Thank you for contacting Resumewala. Our team has received your message
                  and will get back to you within 24 hours.
                </p>

                <p style="color:#374151;font-size:15px;">
                  We appreciate your interest in Resumewala.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:30px 0;">
                <a href="https://resumewala.co.in"
                  style="background:#4f46e5;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;">
                  Visit Website
                </a>
              </td>
            </tr>

            <tr>
              <td style="border-top:1px solid #e5e7eb;padding-top:20px;text-align:center;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} Resumewala
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </div>
  `;
};

export const emailTemplates = {
  // Employer email verification
  employerVerification: (name, url) => `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
      <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">RESUMEWALA</h1>
        <p style="color:#bfdbfe;margin:4px 0 0">India's Smart Job Portal</p>
      </div>
      <div style="padding:32px">
        <h2 style="color:#1e293b;margin-top:0">Hi ${name},</h2>
        <p style="color:#475569;line-height:1.6">Thanks for registering as an employer on Resumewala! Please verify your email to activate your account.</p>
        <a href="${url}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;margin:16px 0">Verify Email</a>
        <p style="color:#94a3b8;font-size:13px">This link expires in 24 hours. If you didn't sign up, ignore this email.</p>
      </div>
      <div style="background:#f8fafc;padding:16px;text-align:center">
        <p style="color:#94a3b8;margin:0;font-size:12px">© ${new Date().getFullYear()} Resumewala. All rights reserved.</p>
      </div>
    </div>
  `,

  // Password reset
  passwordReset: (name, url) => `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
      <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">RESUMEWALA</h1>
      </div>
      <div style="padding:32px">
        <h2 style="color:#1e293b;margin-top:0">Reset Your Password</h2>
        <p style="color:#475569">Hi ${name}, click the button below to reset your password.</p>
        <a href="${url}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;margin:16px 0">Reset Password</a>
        <p style="color:#94a3b8;font-size:13px">This link expires in 1 hour.</p>
      </div>
    </div>
  `,

  // New application notification to employer
  newApplication: (recruiterName, candidateName, jobTitle) => `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
      <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">RESUMEWALA</h1>
      </div>
      <div style="padding:32px">
        <h2 style="color:#1e293b;margin-top:0">New Application Received! 🎉</h2>
        <p style="color:#475569">Hi ${recruiterName},</p>
        <p style="color:#475569"><strong>${candidateName}</strong> has applied for your job posting: <strong>${jobTitle}</strong>.</p>
        <a href="${process.env.FRONTEND_URL}/employer/dashboard/applicants" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;margin:16px 0">View Application</a>
      </div>
    </div>
  `,

  // Application confirmation to candidate
  applicationConfirmation: (candidateName, jobTitle, companyName) => `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
      <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">RESUMEWALA</h1>
      </div>
      <div style="padding:32px">
        <h2 style="color:#1e293b;margin-top:0">Application Submitted ✅</h2>
        <p style="color:#475569">Hi ${candidateName},</p>
        <p style="color:#475569">Your application for <strong>${jobTitle}</strong> at <strong>${companyName || 'the company'}</strong> has been successfully submitted.</p>
        <p style="color:#475569">We'll notify you if the employer responds. Good luck! 🚀</p>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;margin:16px 0">View My Applications</a>
      </div>
    </div>
  `,

  // Payment confirmation
  paymentConfirmation: (recruiterName, planName, amountINR, expiresAt) => `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
      <div style="background:linear-gradient(135deg,#059669,#047857);padding:32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">RESUMEWALA</h1>
      </div>
      <div style="padding:32px">
        <h2 style="color:#1e293b;margin-top:0">Payment Successful! 🎊</h2>
        <p style="color:#475569">Hi ${recruiterName},</p>
        <p style="color:#475569">Your <strong>${planName} Plan</strong> has been activated.</p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:4px 0;color:#166534"><strong>Amount Paid:</strong> ₹${amountINR}</p>
          <p style="margin:4px 0;color:#166534"><strong>Plan:</strong> ${planName}</p>
          <p style="margin:4px 0;color:#166534"><strong>Valid Until:</strong> ${new Date(expiresAt).toLocaleDateString('en-IN')}</p>
        </div>
        <a href="${process.env.FRONTEND_URL}/employer/dashboard" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;margin:16px 0">Go to Dashboard</a>
      </div>
    </div>
  `,

  // Daily summary to employer
  dailySummary: (recruiterName, date, applications) => `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
      <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">RESUMEWALA</h1>
        <p style="color:#bfdbfe;margin:4px 0 0">Daily Application Summary</p>
      </div>
      <div style="padding:32px">
        <h2 style="color:#1e293b;margin-top:0">Summary for ${date}</h2>
        <p style="color:#475569">Hi ${recruiterName}, here's your daily summary:</p>
        <div style="background:#eff6ff;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0;color:#1e40af;font-size:24px;font-weight:700">${applications.length} New Application${applications.length !== 1 ? 's' : ''}</p>
        </div>
        ${applications.length > 0 ? `
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          <thead>
            <tr style="background:#f8fafc">
              <th style="padding:8px;text-align:left;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0">Candidate</th>
              <th style="padding:8px;text-align:left;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0">Job</th>
            </tr>
          </thead>
          <tbody>
            ${applications.map(a => `
              <tr>
                <td style="padding:8px;color:#1e293b;border-bottom:1px solid #f1f5f9">${a.candidateName}</td>
                <td style="padding:8px;color:#475569;border-bottom:1px solid #f1f5f9">${a.jobTitle}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : '<p style="color:#94a3b8">No new applications today.</p>'}
        <a href="${process.env.FRONTEND_URL}/employer/dashboard" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;margin:16px 0">View All</a>
      </div>
    </div>
  `,
};