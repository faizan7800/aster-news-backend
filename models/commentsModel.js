const mongoose = require('mongoose');

const commentsSchema = new mongoose.Schema({
  text: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  newsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News'
  }
}, { timestamps: true });

const Comments = mongoose.model('Comments', commentsSchema);
module.exports = Comments