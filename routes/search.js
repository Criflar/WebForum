const express = require("express");
const router = express.Router();
const Post = require("./../models/post");

// Search bar
router.get('/search', async (req, res) => {
  const searchTerm = req.query.query?.trim();
  const communityFilter = req.query.community; // Get the community filter from the query

  console.log("Received search term:", searchTerm); // Log query to confirm
  console.log("Community filter:", communityFilter); // Log community filter to confirm

  if (!searchTerm) {
    return res.render("search", { query: "", results: [], error: "Search term required", community: null });
  }

  try {
    // Base query for searching by title, description, or community
    const searchQuery = {
      $or: [
        { title: { $regex: searchTerm, $options: "i" } }, // Search by title
        { description: { $regex: searchTerm, $options: "i" } }, // Search by description
        { community: { $regex: searchTerm, $options: "i" } } // Search by community
      ]
    };

    // Add community filter if provided
    if (communityFilter) {
      searchQuery.community = communityFilter; // Filter by the selected community
    }

    // Fetch posts matching the search query
    const results = await Post.find(searchQuery)
      .select("title description author community createdAt score") // Include required fields
      .populate('author', 'username avatar userID') // Populate author details
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    // Fetch the user's votes if logged in
if (req.session.authUserId) {
  const userVotes = await Vote.find({ user: req.session.authUserId }).lean();
  const votesByPostId = {};

  userVotes.forEach(vote => {
    if (vote.post) { // Check if vote.post exists
      votesByPostId[vote.post.toString()] = vote.value;
    }
  });

  // Attach userVote to each post
  results.forEach(post => {
    post.userVote = votesByPostId[post._id?.toString()] || 0; // Default to 0 if no vote
  });
} else {
  // If user is not logged in, set userVote to 0 for all posts
  results.forEach(post => {
    post.userVote = 0;
  });
}

    console.log("Search results:", results); // Log results to confirm they are fetched correctly

    res.render("search", { query: searchTerm, results, error: null, community: communityFilter });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).render("search", { query: searchTerm, results: [], error: "Internal Server Error", community: communityFilter });
  }
});

module.exports = router;