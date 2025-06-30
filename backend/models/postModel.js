const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  classId: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  files: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true }
    }
  ]

},{timestamps:true});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;