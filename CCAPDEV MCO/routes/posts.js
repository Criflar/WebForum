const express = require('express');
const Post = require('./../models/post');
const router = express.Router();

router.use(express.static('public'));

router.get('/new', (req, res) => {
    res.render('posts/newPost', {post: new Post()});
});

router.get('/:id', async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (post == null) {
        res.redirect('../')
    } else {
        res.render('posts/showPost', {post: post});
    }
    
});

router.post('/', async (req, res) => {
    const post = new Post({
        title: req.body.title,
        description: req.body.description,
        author: req.body.author,
        createdAt: req.body.createdAt,
        community: req.body.community
    })

    try {
        article = await post.save();
        res.redirect(`/posts/${post.id}`);
    } catch (e) {
        console.log(e);
        res.render('posts/newPost', {post: post});
    }
    
})

module.exports = router;

