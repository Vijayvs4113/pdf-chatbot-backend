const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch {
    res.status(400).json({ message: "User already exists" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const user = await User.findOne(req.body);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ userId: user._id }, "SECRET_KEY");
  res.json({ token });
});

module.exports = router;
