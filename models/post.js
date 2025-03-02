const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
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
    community: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model('Post', postSchema);