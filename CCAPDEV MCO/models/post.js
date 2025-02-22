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
        type: String,
        required: true,
        default: 'John Pork'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    community: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Post', postSchema);