import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env.js';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const user = env.SMTP_USER?.trim().replace(/['"]/g, '');
  const pass = env.SMTP_PASS?.trim().replace(/['"\s]/g, '');

  if (!user || !pass) {
    return null;
  }

  if (!transporter) {
    const isGmail =
      (env.SMTP_HOST && env.SMTP_HOST.includes('gmail')) ||
      user.toLowerCase().endsWith('@gmail.com');

    if (isGmail) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 15000,
      });
    } else {
      const port = env.SMTP_PORT || 465;
      transporter = nodemailer.createTransport({
        host: env.SMTP_HOST || 'smtp.gmail.com',
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 15000,
      });
    }
  }
  return transporter;
}

export async function sendPasswordResetOtp(toEmail: string, otp: string): Promise<boolean> {
  // Always log the OTP to the server console so it is visible in Render deployment logs
  console.log(`[PASSWORD RESET OTP] 6-digit code for ${toEmail} is: ${otp} (valid for 15 minutes)`);

  const mailer = getTransporter();

  if (!mailer) {
    console.warn(
      `[EMAIL NOTICE] SMTP environment variables (SMTP_USER or SMTP_PASS) are not configured. The OTP was logged above.`,
    );
    throw new Error(
      'Email service is not configured (SMTP_USER or SMTP_PASS missing on server). Check your Render environment variables or check the server logs for the 6-digit OTP code.',
    );
  }

  const user = env.SMTP_USER?.trim().replace(/['"]/g, '');
  const fromAddress = env.SMTP_FROM || `Carekind <${user}>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Reset Your Carekind Password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f2; margin: 0; padding: 24px; color: #232724; }
        .card { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e2da; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .logo { font-size: 20px; font-weight: 700; color: #1e3d34; letter-spacing: -0.5px; margin-bottom: 24px; display: inline-block; }
        h1 { font-size: 20px; color: #1e3d34; margin: 0 0 12px 0; font-weight: 600; }
        p { font-size: 14px; line-height: 1.6; color: #4a524a; margin: 0 0 16px 0; }
        .code-box { background-color: #f4f6f4; border: 1px dashed #2d5a4c; border-radius: 8px; text-align: center; padding: 18px; margin: 24px 0; }
        .otp-code { font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1e3d34; font-family: monospace; }
        .footer { font-size: 12px; color: #788279; border-top: 1px solid #eef0ee; padding-top: 16px; margin-top: 24px; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">🌿 carekind</div>
        <h1>Reset your password</h1>
        <p>We received a request to reset the password for your Carekind account. Use the verification code below to complete the reset:</p>
        <div class="code-box">
          <div class="otp-code">${otp}</div>
        </div>
        <p>This code will expire in <strong>15 minutes</strong>.</p>
        <p>If you didn't request a password reset, you can safely ignore this email — your account remains secure.</p>
        <div class="footer">
          This is an automated message from Carekind. Please do not reply directly to this email.
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `Reset your Carekind password\n\nYour 6-digit verification code is: ${otp}\n\nThis code will expire in 15 minutes. If you did not request this, you can ignore this email.`;

  try {
    console.log(`[EMAIL] Sending password reset email to ${toEmail}...`);
    const info = await mailer.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: 'Your Carekind Password Reset Code',
      text: textContent,
      html: htmlContent,
    });
    console.log(
      `[EMAIL SUCCESS] Email accepted by SMTP server for ${toEmail}. Message ID: ${info.messageId}`,
    );
    return true;
  } catch (error) {
    console.error(
      '[EMAIL ERROR] Failed to send password reset email via SMTP:',
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
}
