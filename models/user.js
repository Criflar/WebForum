const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
            const lastUser = await mongoose.model('User').findOne().sort({ userID: -1 }); // Sort users in terms of descending id
            this.userID = lastUser ? lastUser.userID + 1 : 1; // Start from 1 if no users exist
        }

        next(); 
    } catch (error) {
        next(error); // Pass error to mongoose
    }
})

module.exports = mongoose.model('User', userSchema)