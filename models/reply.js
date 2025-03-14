const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    body: {
        type: String,
        required: true
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, 
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        required: true
    },
    parentReply: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reply',
        required: false
    }
});

module.exports = mongoose.model('Reply', replySchema);