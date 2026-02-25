import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Sage Flow Account',
    html: `
      <h2>Welcome to Sage Flow!</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>This link expires in 24 hours.</p>
    `
  });
};

export const sendDeviceVerificationEmail = async (email, deviceInfo, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-device?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'New Device Login - Sage Flow',
    html: `
      <h2>New Device Login Detected</h2>
      <p>A login was detected from a new device:</p>
      <ul>
        <li><strong>Device:</strong> ${deviceInfo.device}</li>
        <li><strong>Browser:</strong> ${deviceInfo.browser}</li>
        <li><strong>OS:</strong> ${deviceInfo.os}</li>
        <li><strong>IP:</strong> ${deviceInfo.ip}</li>
      </ul>
      <p>If this was you, click the link below to verify this device:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>If this wasn't you, please secure your account immediately.</p>
    `
  });
};
