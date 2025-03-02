// Model used for assigning a sequential count for a document of a specific type (i.e UserID = 1, 2, 3,...)
// Might be unnecessary depending on if we decide not to use sequential ids.
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);
module.exports = Counter;
