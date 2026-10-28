import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env.js';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }
  if (!transporter) {
    const port = env.SMTP_PORT || 465;
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendPasswordResetOtp(toEmail: string, otp: string): Promise<boolean> {
  const mailer = getTransporter();

  if (!mailer) {
    console.warn(
      `[EMAIL NOTICE] SMTP is not configured. Password reset code for ${toEmail} is: ${otp} (valid for 15 minutes)`,
    );
    return true;
  }

  const fromAddress = env.SMTP_FROM || `Carekind <${env.SMTP_USER}>`;

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
    await mailer.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: 'Your Carekind Password Reset Code',
      text: textContent,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error(
      '[EMAIL ERROR] Failed to send password reset email via SMTP:',
      error instanceof Error ? error.message : error,
    );
    throw error;
  }
}
