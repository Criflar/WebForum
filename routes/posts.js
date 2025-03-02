const express = require('express');
const Post = require('./../models/post');
const User = require('./../models/user');
const router = express.Router();



router.get('/new', (req, res) => {
    if (!req.session.authUserId) {
        return res.redirect('/'); // Redirect to home if not logged in
    }
    res.render('posts/newPost', { post: new Post() });
    
});

router.get('/:id', async (req, res) => {
    const post = await Post.findById(req.params.id).populate('author', 'username avatar userID');
    if (post == null) {
        res.redirect('../')
    } else {
        res.render('posts/showPost', {post: post});
    }
    
});

router.post('/', async (req, res) => {
    if (!req.session.authUserId) {
        return res.status(401).json({ message: "Logged in user not found." });
    }


    const post = new Post({
        title: req.body.title,
        description: req.body.description,
        author: req.session.authUserId, // Currently logged in user
        createdAt: req.body.createdAt,
        community: req.body.community
    })

    try {
        await post.save();
        res.redirect(`/posts/${post.id}`);
    } catch (e) {
        console.log(e);
        res.render('posts/newPost');
    }
    
});



module.exports = router;

