// models/chatMessageModel.js

const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  classroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
