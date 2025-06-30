// routes/chatRoutes.js

const express = require('express');
const ChatMessage = require('../models/chatMessageModel');
const authTokenHandler = require('../middlewares/checkAuthToken');

const router = express.Router();

// GET all messages for a classroom
router.get('/messages/:classroomId', authTokenHandler, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ classroomId: req.params.classroomId })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 });

    res.json({ ok: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Failed to fetch messages', error: err });
  }
});

//DELETE all message for a classroom
router.delete('/messages/:classroomId',authTokenHandler, async(req,res)=>{
    try{
        await ChatMessage.deleteMany({classroomId: req.params.classroomId});
        res.json({ok:true, message:'Chat cleared'});
    }
    catch(err){
        console.log(err);
        res.status(500).json({ok:false, message: 'Failed to clear chat', error: err });
    }
});

module.exports = router;
