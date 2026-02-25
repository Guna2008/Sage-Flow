import dotenv from 'dotenv';

dotenv.config();

export const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  
  console.log('\n📧 VERIFICATION EMAIL');
  console.log('To:', email);
  console.log('Subject: Verify Your Sage Flow Account');
  console.log('Link:', verifyUrl);
  console.log('---\n');
  
  return Promise.resolve();
};

export const sendDeviceVerificationEmail = async (email, deviceInfo, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-device?token=${token}`;
  
  console.log('\n📧 NEW DEVICE LOGIN EMAIL');
  console.log('To:', email);
  console.log('Device:', deviceInfo.device);
  console.log('Browser:', deviceInfo.browser);
  console.log('OS:', deviceInfo.os);
  console.log('Verify Link:', verifyUrl);
  console.log('---\n');
  
  return Promise.resolve();
};
