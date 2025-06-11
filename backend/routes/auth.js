const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "Email already registered" });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ user: { name: user.name, email: user.email }, token });
});

module.exports = router;