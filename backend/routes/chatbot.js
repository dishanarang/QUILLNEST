const express = require('express');
const router = express.Router();
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

router.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`
,
      {
        contents: [{ parts: [{ text: message }] }]
      }
    );

    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    res.status(200).json({ success: true, reply });
  } catch (err) {
    console.error('Gemini API error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Gemini API failed', error: err.message });
  }
});

module.exports = router;
