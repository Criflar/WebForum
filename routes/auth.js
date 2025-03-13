const express = require("express");
const bcrypt = require('bcrypt');

const User = require('../models/user');

const router = express.Router();


router.post("/register", async (req, res) => {
    const {username, password} = req.body;

    
    try {  
        const existingUser = await User.findOne({ username });

        // Check if username exists
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const newUser = new User({
            username: username, 
            password: password}); // Create new user document.

       
        await newUser.save();   // Save new user to db.
        res.status(201).json({ message: "User registered successfully" });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error registering user" });
    }
    
    
});

router.post("/login", async (req, res) => {
    const {username, password, rememberMe} = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({message: "User not found"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({message: "Incorrect password"});
        }


        // Store unique mongoose field id in session
        req.session.authUserId = user._id;  

        // Extend session to 3 weeks if remember me is checked
        if (rememberMe) {
            req.session.cookie.maxAge = 21 * 24 * 60 * 60 * 1000; 
            console.log("Session extended to 3 weeks.");
        } 


        res.json({ message: "Login successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).json({ message: "Logout failed" });
        }

        res.clearCookie("connect.sid"); 
        res.redirect("/");
    });
})

module.exports = router;