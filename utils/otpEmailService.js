import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Generate 4-digit OTP
export const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification - Your OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0;">Email Verification</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Thank you for signing up! Please use the following OTP to verify your email address:
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px dashed #667eea;">
            <h1 style="color: #667eea; font-size: 32px; margin: 0; letter-spacing: 8px;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">
            This OTP will expire in 5 minutes. If you didn't request this verification, please ignore this email.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
            <p style="color: #999; font-size: 12px;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};