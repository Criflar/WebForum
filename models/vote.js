const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  // Value is 1 for an upvote and -1 for a downvote
  value: { type: Number, enum: [1, -1], required: true }
});

// Check if vote must be linked to either a post or a comment, but not both
voteSchema.pre('validate', function(next) {
  if (!this.post && !this.comment) {
    return next(new Error("A vote must be linked to either a post or a comment."));
  }
  if (this.post && this.comment) {
    return next(new Error("A vote cannot be linked to both a post and a comment."));
  }
  next();
});

module.exports = mongoose.model('Vote', voteSchema);