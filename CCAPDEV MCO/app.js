const express = require('express');
const mongoose = require('mongoose');
const Post = require('./models/post');
const postRouter = require('./routes/posts.js');
const app = express();

mongoose.connect('mongodb://localhost/forum');

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false}));
app.use(express.static('public'));




app.get('/', async (req, res) => {
    const posts = await Post.find().sort({
        createdAt: 'desc' 
    })
    res.render('index', {posts: posts});
})

app.use('/posts', postRouter);

app.listen(3000);