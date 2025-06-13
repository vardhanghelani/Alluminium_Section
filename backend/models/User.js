// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: String,
  otp: String,
  otpExpiry: Date,
  isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', UserSchema);
