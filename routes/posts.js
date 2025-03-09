const express = require('express');
const Post = require('./../models/post');
const Vote = require('../models/vote');
const User = require('./../models/user');
const router = express.Router();



router.get('/new', (req, res) => {
    if (!req.session.authUserId) {
        return res.redirect('/'); // Redirect to home if not logged in
    }
    res.render('posts/newPost', { post: new Post() });
    
});

router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'username avatar userID').lean();

        if (!post) {
            return res.redirect('../'); // Post not found, redirect to home
        }

        // Check if logged in user voted.
        if (req.session.authUserId) {
          const userVote = await Vote.findOne({ user: req.session.authUserId, post: req.params.id });
          post.userVote = userVote ? userVote.value : 0;
        }

        res.render('posts/showPost', { post });
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).send("Error fetching post.");
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

// POST /posts/vote
// Expects JSON: { postId: String, vote: Number }
// where vote is 1 (upvote) or -1 (downvote) or null (remove vote)
// POST /posts/vote
router.post('/vote', async (req, res) => {
    const { postId, vote } = req.body; // vote is expected to be 1 or -1
  
    // Only allow logged-in users to vote.
    if (!req.session.authUserId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
   
  
    try {
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ error: 'Post not found' });
  
      // Check for an existing vote by this user on this post.
      const existingVote = await Vote.findOne({ user: req.session.authUserId, post: postId });
      let netDelta = 0;
  
      if (!existingVote && vote !== null) {
        // Create a new vote if none exists.
        const newVote = new Vote({
          user: req.session.authUserId,
          post: postId,
          value: vote
        });
        await newVote.save();
        netDelta = vote;

      } else {
        if (vote === null) {
          // Same vote exists: undo the vote.
          netDelta = -existingVote.value;   // Value to be added to score (reverse value of undoed vote).
          await Vote.deleteOne({ _id: existingVote._id });  // Delete the existing vote.
        } else if (existingVote.value !== vote) {
          // Switch vote direction.
          netDelta = 2 * vote;
          await Vote.updateOne({ _id: existingVote._id }, { value: vote });
        }
      }
  
      // Update the post's score permanently.
      if (netDelta !== 0)  await Post.updateOne({ _id: postId }, { $inc: { score: netDelta } });
  

       // Fetch updated post to get the correct score
       const updatedPost = await Post.findById(postId);

       res.json({ newScore: updatedPost.score }); // Send new score as json for fetch api

    } catch (err) {
      console.error('Error updating vote:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  


router.get('/', async (req, res) => {
    try {
      // Get the current page number from the query (default to page 1)
      const currentPage = parseInt(req.query.page) || 1;
      const perPage = 5; // Adjust as needed
  
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
        const userVotes = await Vote.find({ user: req.session.authUserId }).lean();
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
  
      // Render the template and pass the necessary data
      res.render('index', {
        posts,
        currentPage,
        totalPages,
        sort: sortParam || 'newest', // Pass sort parameter to preserve sort links
        loggedUser: req.session.authUserId
      });
    } catch (err) {
      console.error('Error fetching posts:', err);
      res.status(500).send('Server error');
    }


});
  
module.exports = router;
  

