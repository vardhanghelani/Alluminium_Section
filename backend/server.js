const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const User = require('./models/User');
const sendOTP = require('./utils/sendOTP');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ DB error', err));

// ✅ Request OTP for Register/Login
app.post('/api/request-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  let user = await User.findOne({ email });

  if (!user) {
    user = new User({ email, otp, otpExpiry });
  } else {
    user.otp = otp;
    user.otpExpiry = otpExpiry;
  }

  await user.save();
  await sendOTP(email, otp);

  res.json({ message: 'OTP sent to your email' });
});

// ✅ Verify OTP (for Register/Login)
app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  res.json({ message: 'OTP verified successfully', user: { email: user.email } });
});

// 🔑 Forgot Password - Send OTP
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  await sendOTP(email, otp);

  res.json({ message: 'OTP sent for password reset' });
});

// 🔐 Reset Password
app.post('/api/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  user.password = newPassword;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  res.json({ message: 'Password reset successful' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
