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
    try {
            const page = parseInt(req.query.page) || 1;     // Get current page from URL, default to 1 if not found
            const pageLimit = 15;
            const skip = (page - 1) * pageLimit;
          
            // Count the total number of posts to calculate total pages
            const totalPosts = await Post.countDocuments();
         
        
            const posts = await Post.find()
            .sort({ createdAt: 'desc' }) 
            .skip(skip) // Skips a number of posts when fetching
            .limit(pageLimit)   // Limit the number of posts fetched
            .populate('author', 'username avatar userID')   // Include other fields to author object
            .lean(); // Convert Mongoose objects to plain JS objects


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

            res.render('index', { 
                posts, 
                currentPage: page, 
                totalPages: Math.ceil(totalPosts / pageLimit), 
            });

    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});


app.use('/posts', postRouter);
app.use('/auth', authRouter);
app.use('/users', userRouter);

app.listen(3000);