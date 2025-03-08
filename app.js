const express = require('express');
const mongoose = require('mongoose');
const session = require("express-session");
const cookieParser = require("cookie-parser");


const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/forum')
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("Failed to connect to MongoDB"));


app.use(express.static('public'));  // Allow serving of files from public
app.use(express.urlencoded({extended: true}));

app.use(express.json()); 
app.use(cookieParser())
app.use(
    session({
        secret: "johnporksecretstash",
        resave: false,
        saveUninitialized: false,
    })
)

// Initialize models
const Post = require('./models/post');
const User = require('./models/user');
const Vote = require('./models/vote');

// Initialize routes
const postRouter = require('./routes/posts.js');
const authRouter = require('./routes/auth.js');
const userRouter = require('./routes/users.js');


// Middleware to fetch logged in user data for views
app.use(async (req, res, next) => {
    if (req.session.authUserId) {
        res.locals.loggedUser = await User.findById(req.session.authUserId); 
    } else {
        res.locals.loggedUser = null; // not logged in
    }
    next();
});

app.set('view engine', 'ejs');

// Homepage route
app.get('/', async (req, res) => {
    const posts = await Post.find().sort({
        createdAt: 'desc' 
    }).populate('author', 'username avatar userID')
    res.render('index', {posts: posts});
})

app.use('/posts', postRouter);
app.use('/auth', authRouter);
app.use('/users', userRouter);

app.listen(3000);