export const welcomeTemplate = (name) => {
  return `
  <div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:40px;box-shadow:0 8px 24px rgba(0,0,0,0.05);">

            <!-- Logo / Brand -->
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h1 style="margin:0;color:#111827;">Resumewala</h1>
                <p style="margin:5px 0 0;font-size:14px;color:#6b7280;">
                  Upload Your Resume Once. <br/>
                  <strong>Get Discovered by Employers.</strong>
                </p>
              </td>
            </tr>

            <!-- Welcome Text -->
            <tr>
              <td style="padding-top:20px;">
                <h2 style="color:#4f46e5;margin-bottom:10px;">
                  Welcome, ${name}! 🎉
                </h2>

                <p style="color:#374151;font-size:15px;line-height:1.6;">
                  Your account has been successfully created.
                  You're now one step closer to getting discovered by verified employers.
                </p>

                <p style="color:#374151;font-size:15px;line-height:1.6;">
                  Upload your resume once and let employers find you —
                  no more applying again and again.
                </p>
              </td>
            </tr>

            <!-- CTA Button -->
            <tr>
              <td align="center" style="padding:30px 0;">
                <a href="http://localhost:5173"
                   style="background:#4f46e5;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
                   Upload Resume Now
                </a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="border-top:1px solid #e5e7eb;padding-top:20px;text-align:center;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} Resumewala. All rights reserved.
                <br/>
                Helping job seekers connect with verified employers.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
};    

export const verifyEmailTemplate = (name, verifyUrl) => {
  return `
  <div style="background:#f3f4f6;padding:40px;font-family:Arial;">
    <table width="600" align="center" style="background:#ffffff;padding:40px;border-radius:12px;">
      
      <tr>
        <td align="center">
          <h1 style="margin:0;color:#111827;">Resumewala</h1>
          <p style="color:#6b7280;font-size:14px;">
            Upload Your Resume Once. Get Discovered by Employers.
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding-top:30px;">
          <h2 style="color:#10b981;">Verify Your Email Address</h2>
          <p style="color:#374151;">
            Hi ${name},
          </p>
          <p style="color:#374151;">
            Please confirm your email address to activate your Resumewala account.
          </p>
        </td>
      </tr>

      <tr>
        <td align="center" style="padding:30px 0;">
          <a href="${verifyUrl}"
             style="background:#10b981;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;">
             Verify Email
          </a>
        </td>
      </tr>

      <tr>
        <td style="font-size:12px;color:#9ca3af;text-align:center;">
          This link expires in 24 hours.
        </td>
      </tr>

    </table>
  </div>
  `;
};

export const resetPasswordTemplate = (name, resetUrl) => {
  return `
  <div style="background:#f3f4f6;padding:40px;font-family:Arial;">
    <table width="600" align="center" style="background:#ffffff;padding:40px;border-radius:12px;">

      <tr>
        <td align="center">
          <h1 style="margin:0;color:#111827;">Resumewala</h1>
          <p style="color:#6b7280;font-size:14px;">
            Upload Your Resume Once. Get Discovered by Employers.
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding-top:30px;">
          <h2 style="color:#ef4444;">Reset Your Password</h2>
          <p style="color:#374151;">
            Hello ${name},
          </p>
          <p style="color:#374151;">
            We received a request to reset your password.
            Click the button below to set a new password.
          </p>
        </td>
      </tr>

      <tr>
        <td align="center" style="padding:30px 0;">
          <a href="${resetUrl}"
             style="background:#ef4444;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;">
             Reset Password
          </a>
        </td>
      </tr>

      <tr>
        <td style="font-size:12px;color:#9ca3af;text-align:center;">
          This link expires in 15 minutes.
        </td>
      </tr>

    </table>
  </div>
  `;
};

export const adminNotificationTemplate = (user) => {
  return `
  <div style="background:#f3f4f6;padding:40px;font-family:Arial;">
    <table width="600" align="center" style="background:#ffffff;padding:40px;border-radius:12px;">

      <tr>
        <td align="center">
          <h2 style="margin:0;color:#111827;">🚀 New User Registered</h2>
        </td>
      </tr>

      <tr>
        <td style="padding-top:20px;color:#374151;font-size:15px;">
          <p><strong>Name:</strong> ${user.fullName}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Mobile:</strong> ${user.mobileNumber}</p>
        </td>
      </tr>

      <tr>
        <td style="padding-top:30px;font-size:12px;color:#9ca3af;text-align:center;">
          Resumewala Admin Notification
        </td>
      </tr>

    </table>
  </div>
  `;
};

// ✅ Email to USER — confirmation of their application
export const jobAppliedUserTemplate = (name, jobTitle, company) => {
  return `
  <div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:40px;box-shadow:0 8px 24px rgba(0,0,0,0.05);">

            <!-- Logo / Brand -->
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h1 style="margin:0;color:#111827;">Resumewala</h1>
                <p style="margin:5px 0 0;font-size:14px;color:#6b7280;">
                  Upload Your Resume Once. <br/>
                  <strong>Get Discovered by Employers.</strong>
                </p>
              </td>
            </tr>

            <!-- Application Confirmed -->
            <tr>
              <td style="padding-top:20px;">
                <h2 style="color:#4f46e5;margin-bottom:10px;">
                  Application Submitted! 🎉
                </h2>
                <p style="color:#374151;font-size:15px;line-height:1.6;">
                  Hi <strong>${name}</strong>, your application has been successfully submitted. Here's a summary:
                </p>

                <!-- Job Info Box -->
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0;">
                  <tr>
                    <td style="padding:8px 16px;">
                      <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Job Title</p>
                      <p style="margin:4px 0 0;font-size:16px;font-weight:bold;color:#111827;">${jobTitle}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 16px;">
                      <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Company</p>
                      <p style="margin:4px 0 0;font-size:16px;font-weight:bold;color:#4f46e5;">${company}</p>
                    </td>
                  </tr>
                </table>

                <p style="color:#374151;font-size:15px;line-height:1.6;">
                  The employer will review your profile and resume. We'll keep you updated on next steps.
                </p>
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td align="center" style="padding:30px 0;">
                <a href="http://localhost:5173"
                   style="background:#4f46e5;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
                   View More Jobs
                </a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="border-top:1px solid #e5e7eb;padding-top:20px;text-align:center;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} Resumewala. All rights reserved.
                <br/>
                Helping job seekers connect with verified employers.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
};


// ✅ Email to ADMIN — new application notification
export const jobAppliedAdminTemplate = (candidateName, candidateEmail, jobTitle, company) => {
  return `
  <div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:40px;box-shadow:0 8px 24px rgba(0,0,0,0.05);">

            <!-- Logo / Brand -->
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h1 style="margin:0;color:#111827;">Resumewala</h1>
                <p style="margin:5px 0 0;font-size:14px;color:#6b7280;">Admin Notification</p>
              </td>
            </tr>

            <!-- Notification -->
            <tr>
              <td style="padding-top:20px;">
                <h2 style="color:#4f46e5;margin-bottom:10px;">
                  📋 New Job Application Received
                </h2>
                <p style="color:#374151;font-size:15px;line-height:1.6;">
                  A candidate has just applied for a job on Resumewala.
                </p>

                <!-- Info Box -->
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0;">
                  <tr>
                    <td style="padding:8px 16px;">
                      <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Candidate Name</p>
                      <p style="margin:4px 0 0;font-size:16px;font-weight:bold;color:#111827;">${candidateName}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 16px;">
                      <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Candidate Email</p>
                      <p style="margin:4px 0 0;font-size:16px;font-weight:bold;color:#4f46e5;">${candidateEmail}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 16px;">
                      <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Job Title</p>
                      <p style="margin:4px 0 0;font-size:16px;font-weight:bold;color:#111827;">${jobTitle}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 16px;">
                      <p style="margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Company</p>
                      <p style="margin:4px 0 0;font-size:16px;font-weight:bold;color:#111827;">${company}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="border-top:1px solid #e5e7eb;padding-top:20px;text-align:center;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} Resumewala. All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
};