const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const User = require('./models/User');
const sendOTP = require('./utils/sendOTP');

const app = express();
app.use(cors({
  origin:'http://rajwindow.vercel.app', // Allow all origins by default
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ DB error', err));

// ✅ Request OTP (Login/Register)
app.post('/api/request-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const normalizedEmail = email.toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  try {
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = new User({
        email: normalizedEmail,
        otp,
        otpExpiry,
        isVerified: false,
      });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
    }

    await user.save();

    console.log("OTP saved in DB:", user.otp);
    await sendOTP(normalizedEmail, otp);

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ success: false, message: 'Server error while sending OTP.' });
  }
});

// ✅ Verify OTP - FIXED VERSION
// ✅ Verify OTP - SIMPLIFIED AND FIXED
app.post("/api/verify-otp", async (req, res) => {
  console.log("🔍 Verify OTP endpoint hit");
  console.log("📥 Request body:", req.body);

  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      console.log("❌ Missing email or OTP");
      return res.status(400).json({ 
        success: false, 
        message: "Email and OTP are required" 
      });
    }

    const normalizedEmail = email.toLowerCase();
    console.log("🔍 Looking for user:", normalizedEmail);
    
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    console.log("👤 User found:", user.email);
    console.log("🔢 Stored OTP:", user.otp, "Type:", typeof user.otp);
    console.log("🔢 Entered OTP:", otp, "Type:", typeof otp);

    if (!user.otp || !user.otpExpiry) {
      console.log("❌ No OTP or expiry found");
      return res.status(400).json({ 
        success: false, 
        message: "No OTP found. Please request a new one." 
      });
    }

    if (user.otpExpiry < new Date()) {
      console.log("❌ OTP expired");
      return res.status(400).json({ 
        success: false, 
        message: "OTP has expired. Please request a new one." 
      });
    }

    const storedOTP = user.otp.toString().trim();
    const enteredOTP = otp.toString().trim();

    console.log("🔍 Comparing OTPs:");
    console.log("  Stored (trimmed):", storedOTP);
    console.log("  Entered (trimmed):", enteredOTP);
    console.log("  Match:", storedOTP === enteredOTP);

    if (storedOTP !== enteredOTP) {
      console.log("❌ OTP mismatch");
      return res.status(400).json({ 
        success: false, 
        message: "Incorrect OTP. Please try again." 
      });
    }

    // SUCCESS - Update user
    console.log("✅ OTP matches! Updating user...");
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    console.log("✅ User updated successfully");

    const successResponse = { 
      success: true, 
      message: "OTP verified successfully", 
      user: {
        email: user.email,
        isVerified: user.isVerified,
        _id: user._id
      }
    };

    console.log("📤 Sending success response:", successResponse);
    
    // IMPORTANT: Make sure we're sending the response correctly
    return res.status(200).json(successResponse);

  } catch (err) {
    console.error("🚨 Server error in verify-otp:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during verification" 
    });
  }
});

// 🔑 Forgot Password - Send OTP
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOTP(email, otp);

    res.json({ success: true, message: 'OTP sent for password reset' });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 🔐 Reset Password
app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));