const express = require('express');
const mongoose = require('mongoose');
const session = require("express-session");
const cookieParser = require("cookie-parser");

const app = express();

// Initialize models
const Post = require('./models/post');
const User = require('./models/user');
const Vote = require('./models/vote');
const Comment = require('./models/comment');

// Initialize routes
const postRouter = require('./routes/posts.js');
const authRouter = require('./routes/auth.js');
const userRouter = require('./routes/users.js');
const commentRouter = require('./routes/comments.js');
const searchRouter = require('./routes/search.js');

// Connect to MongoDB
mongoose.connect('mongodb+srv://StellarNexus:StellarNexus@cluster0.3piwb.mongodb.net/forum?retryWrites=true&w=majority&appName=Cluster0')
.then(() => {
  console.log("Connected to MongoDB");

  // Place route definitions and middleware here
  app.use(postRouter);
  app.use('/auth', authRouter);
  app.use('/users', userRouter);
  app.use('/comments', commentRouter);
  app.use('/search', searchRouter);

  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
})
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


// Middleware to fetch logged in user data for views
app.use(async (req, res, next) => {
    if (req.session.authUserId) {
        res.locals.loggedUser = await User.findById(req.session.authUserId); 
    } else {
        res.locals.loggedUser = null; // not logged in
    }
    next();
});


// Function to format post creation dates for views.
app.locals.timeAgo = function (date) {
  const now = new Date();
  const diffMs = now - new Date(date); // difference in milliseconds
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''} ago`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
};

app.set('view engine', 'ejs');

// HOMEPAGE ROUTE
app.get('/', async (req, res) => {
    try {
      // Get the current page number from the query (default to page 1)
      const currentPage = parseInt(req.query.page) || 1;
      const perPage = 15; // Adjust as needed
  
      // Determine the sort criteria
      // Default is "newest" sorted by createdAt descending
      const sortParam = req.query.sort;
      let sortQuery = { createdAt: -1 }; // -1 for descending (latest first)
      if (sortParam === 'popular') {
        sortQuery = { score: -1 }; // -1 for descending (highest scores first)
      }
  
      // Count total posts (for pagination)
      const totalPosts = await Post.countDocuments();
  
      // Calculate total pages
      const totalPages = Math.ceil(totalPosts / perPage);
  
      // Fetch posts with the appropriate sorting and pagination
      let posts = await Post.find()
        .sort(sortQuery)
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .populate('author', 'username avatar userID')
        .lean();
  
      // Attach userVote to each post if user is logged in
      if (req.session.authUserId) {
        const userVotes = await Vote.find({ user: req.session.authUserId, post: { $ne: null } }).lean();
        const votesByPostId = {};
        userVotes.forEach(vote => {
          votesByPostId[vote.post.toString()] = vote.value;
        });
        posts.forEach(post => {
          post.userVote = votesByPostId[post._id.toString()] || 0;
        });
      } else {
        posts.forEach(post => {
          post.userVote = 0;
        });
      }

      community = null;
  
      // Render the template and pass the necessary data
      res.render('index', {
        posts,
        currentPage,
        totalPages,
        sort: sortParam || 'newest', // Pass sort parameter to preserve sort links
        community
      });
    } catch (err) {
      console.error('Error fetching posts:', err);
      res.status(500).send('Error rendering index');
    }
});