const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true }, 
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        required: false
    },
    score: {
        type: Number,
        required: true,
        default: 0
    },
});

module.exports = mongoose.model('Comment', commentSchema);