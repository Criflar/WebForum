const express = require('express');
const Post = require('./../models/post');
const Vote = require('../models/vote');
const User = require('./../models/user');
const Comment = require('./../models/comment')
const router = express.Router();

router.post('/', async (req, res) => {
    if (!req.session.authUserId) {
        return res.status(401).json({ message: "Logged in user not found." });
    }

    const comment = new Comment({
        body: req.body.comment,
        author: req.session.authUserId, // Currently logged-in user
        createdAt: req.body.createdAt,
        post: req.body.post,
        parent: req.body.parent || null, // Set parent if it's a reply
    });

    try {
        const post = await Post.findById(req.body.post);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        await comment.save();

        res.redirect(`/c/${post.community}/posts/${req.body.post}`);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Error posting comment." });
    }

    
});


router.post('/vote', async (req, res) => {
    const { postId, vote } = req.body; // vote is expected to be 1 or -1
  
    // Only allow logged-in users to vote.
    if (!req.session.authUserId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
   
  
    try {
      const comment = await Comment.findById(postId);
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


  
module.exports = router;
  

