const express = require("express");
const router = express.Router();
const Post = require("./../models/post");

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
  
      const results = await Post.find(searchQuery)
        .select("title description author community createdAt score") // Include required fields
        .populate('author', 'username avatar userID') // Populate author details
        .sort({ createdAt: -1 }) // Sort by newest first
        .lean();
  
      console.log("Search results:", results); // Log results to confirm they are fetched correctly
  
      res.render("search", { query: searchTerm, results, error: null, community: communityFilter });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).render("search", { query: searchTerm, results: [], error: "Internal Server Error", community: communityFilter });
    }
  });

module.exports = router;