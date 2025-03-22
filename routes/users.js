const express = require('express');
const fileUpload = require("express-fileupload");
const path = require('path'); 
const fs = require('fs');
const Post = require('./../models/post');
const User = require('./../models/user');
const Vote = require('./../models/vote');
const Comment = require('./../models/comment');
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
    try {
        const { userID } = req.params; 
        const user = await User.findOne({ userID }); // Find user by userID

        if (!user) {
            return res.status(404).send("User not found");
        } 

        // Get current page number and items per page
        const currentPage = parseInt(req.query.page) || 1;
        const perPage = 5; // Adjust as needed

        // Fetch all posts and comments 
        const posts = await Post.find({ author: user }) 
            .sort({ createdAt: -1 })
            .populate('author', 'username avatar userID')
            .lean();

        const comments = await Comment.find({ author: user }) 
            .populate('author', 'username avatar')
            .populate('post', 'title _id community')
            .populate({
                path: 'parent',
                populate: { path: 'author', select: 'username' }
            })
            .sort({ createdAt: -1 })
            .lean();

        // Merge and sort all items by creation date
        let items = [...posts, ...comments];
        items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); 

        // Count total items 
        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / perPage);

        // Apply pagination
        items = items.slice((currentPage - 1) * perPage, currentPage * perPage);

        // If user is logged in, fetch their votes
        if (req.session.authUserId) {
            const userVotes = await Vote.find({ user: req.session.authUserId }).lean();
            const votesByItemId = {};
            userVotes.forEach(vote => {
                if (vote.post) votesByItemId[vote.post.toString()] = vote.value;
                if (vote.comment) votesByItemId[vote.comment.toString()] = vote.value;
            });
            items.forEach(item => {
                item.userVote = votesByItemId[item._id.toString()] || 0;
            });
        } else {
            items.forEach(item => {
                item.userVote = 0;
            });
        }

        res.render('users/showProfile', { 
            user, 
            items, 
            currentPage, 
            totalPages 
        });

    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).send('Error loading user profile');
    }
});




module.exports = router;

