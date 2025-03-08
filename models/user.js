const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Counter = require('./counter');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5
    }, 
    avatar: {
        type: String, 
        default: '/images/avatars/defaultAvatar.png'
    },
    description: {
        type: String,
        default: "Hello!"
    },
    userID: {
        type: Number,
        unique: true
    }
});

// Hash passwords and increment userID before saving to database.
userSchema.pre('save', async function(next) {

    try {
        if (this.isModified('password')) {  // Hash passwords only when they are modified/added
            // Generate salt and hash password
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }


        // Auto-increment userID before saving new user
        if (this.isNew) {
            const counter = await Counter.findOneAndUpdate(
                { _id: 'userID' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );

            this.userID = counter.seq;
        }

        next(); 
    } catch (error) {
        next(error); // Pass error to mongoose
    }
})

module.exports = mongoose.model('User', userSchema)