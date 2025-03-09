const express = require('express');
const fileUpload = require("express-fileupload");
const path = require('path'); 
const fs = require('fs');
const Post = require('./../models/post');
const User = require('./../models/user');
const Vote = require('./../models/vote');
const router = express.Router();

router.use(fileUpload());

router.get('/edit', async (req, res) => {
    if (!req.session.authUserId) {
        return res.redirect('/');
    }

    res.render('users/editProfile');
});

router.post('/edit', async (req, res) => {
    if (!req.session.authUserId) {
        return res.redirect('/');
    }

    try {
        const user = await User.findById(req.session.authUserId);
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Set new description if changed
        if (req.body.description != user.description) {
            user.description = req.body.description;
        }

        // Handle avatar upload
        if (req.files && req.files.avatar) {
            let avatar = req.files.avatar;
            let uploadPath = path.join(__dirname, '../public/images/avatars/', avatar.name); 

            // Delete the old avatar (excluding default avatar)
            if (user.avatar && !user.avatar.includes('defaultAvatar.png')) {
                let oldAvatarPath = path.join(__dirname, '../public', user.avatar);
                
                if (fs.existsSync(oldAvatarPath)) {
                    fs.unlinkSync(oldAvatarPath);
                    console.log(`Deleted avatar: ${oldAvatarPath}`);
                }
            }

            // Move new avatar to upload path
            await avatar.mv(uploadPath);

            user.avatar = `/images/avatars/${avatar.name}`; 
        }

        await user.save();
        res.redirect(`/users/${user.userID}`);

    } catch (error) {
        console.error(error);
        res.status(500).send("Error editing profile");
    }
});


router.get('/:userID', async (req, res) => {
    const { userID } = req.params; 
    const user = await User.findOne({ userID }); // Find user by userID

    if (!user) {
        return res.status(404).send("User not found");
    } 
    

    const posts = await Post.find({ author: user }) 
        .sort({ createdAt: 'desc' }).populate('author', 'username avatar userID');

    // If user is logged in, search for voted posts
    if (req.session.authUserId) {
        // Get all votes by the logged-in user
        const userVotes = await Vote.find({ 
            user: req.session.authUserId, 
            post: { $in: posts.map(post => post._id) } 
        });

        // Convert votes into a map: 
        const voteMap = userVotes.reduce((acc, vote) => {
            acc[vote.post.toString()] = vote.value;     // vote.post (post._id) -> vote.value (-1 or 1)
            return acc;
        }, {});

        // Attach new userVote field to each post that determines if logged in user voted or not.
        posts.forEach(post => {
            post.userVote = voteMap[post._id.toString()] || 0; // Default to 0 if no vote
        });
    } 
    res.render('users/showProfile', { user, posts });

});



module.exports = router;

