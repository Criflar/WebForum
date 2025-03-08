const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  // Value is 1 for an upvote and -1 for a downvote
  value: { type: Number, enum: [1, -1], required: true }
});

module.exports = mongoose.model('Vote', voteSchema);
