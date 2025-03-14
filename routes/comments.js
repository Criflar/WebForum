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


// Route to handle deletion of comments
router.post('/:id/delete', async (req, res) => {
  if (!req.session.authUserId) {
    return res.status(401).json({ message: "Logged in user not found." });
  }
  

  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment.author.equals(req.session.authUserId)) {
      return res.status(403).json({ message: "Unauthorized user" });
    }


    const post = await Post.findById(comment.post);
    

    await comment.deleteOne()

    console.log(post);
    res.redirect(`/c/${post.community}/posts/${post._id}`);
    
  } catch (e) {
    res.status(401).json({message: "Failed to edit comment"});
  }
})

router.post('/vote', async (req, res) => {
    const { commentId, vote } = req.body; // vote is expected to be 1 or -1
  
    // Only allow logged-in users to vote.
    if (!req.session.authUserId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
  
    try {
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        // Check for an existing vote by this user on this comment.
        const existingVote = await Vote.findOne({ user: req.session.authUserId, comment: commentId });
        let netDelta = 0;

        if (!existingVote && vote !== null) {
            // Create a new vote if none exists.
            const newVote = new Vote({
                user: req.session.authUserId,
                comment: commentId,
                value: vote
            });
            await newVote.save();
            netDelta = vote;

        } else {
            if (vote === null) {
                // Undo the vote (delete it).
                netDelta = -existingVote.value; // Reverse value of undone vote
                await Vote.deleteOne({ _id: existingVote._id }); // Remove the vote
            } else if (existingVote.value !== vote) {
                // Change vote direction
                netDelta = 2 * vote;
                await Vote.updateOne({ _id: existingVote._id }, { value: vote });
            }
        }

        // Update the comment's score
        if (netDelta !== 0) {
            await Comment.updateOne({ _id: commentId }, { $inc: { score: netDelta } });
        }

        // Fetch updated comment to get the correct score
        const updatedComment = await Comment.findById(commentId);

        res.json({ newScore: updatedComment.score }); // Send new score for frontend updates

    } catch (err) {
        console.error('Error updating vote:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id/edit', async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      const user = await User.findById(req.session.authUserId);
  
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
  
      if (!user || !comment.author.equals(user._id)) {
        return res.redirect('/'); // Redirect if unauthorized
      }
  
      res.render('comments/editComment', {
        comment
      });
  
    } catch (e) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  });
  
  //  Route to handle comment editing
  router.post('/:id/edit', async (req, res) => {
    if (!req.session.authUserId) {
      return res.status(401).json({ message: "Logged in user not found." });
    }
  
    try {
      const comment = await Comment.findById(req.params.id);
      const post = await Post.findById(comment.post);
  
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
  
      if (!comment.author.equals(req.session.authUserId)) {
        return res.status(403).json({ message: "Unauthorized user" });
      }
  
      // If the new comment text is the same as the old one, no need to update
      if (req.body.comment.trim() === comment.body.trim()) {
        return res.redirect(`/c/${comment.post}/posts/${comment.post}`); // Redirect back to post
      }
  
      
      // Update comment
      comment.body = req.body.comment.trim();
      comment.commentEdited = true; // Mark as edited
  
      await comment.save();
      res.redirect(`/c/${post.community}/posts/${post._id}`);
  
    } catch (e) {
      res.status(500).json({ message: "Failed to edit comment" });
    }
  });



  
module.exports = router;
  

