const express = require('express');
const router = express.Router();
const User = require('../models/userModel');

// Public route to fetch all teacher profiles
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('name email profilePic');
    res.status(200).json({ ok: true, teachers });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Failed to fetch teachers', error });
  }
});

module.exports = router;