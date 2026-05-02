const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const Post = require("../models/Post");
const User = require("../models/User"); // <-- Import your User model
const mongoose = require("mongoose");
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/create", upload.single("image"), async (req, res) => {
  try {
    // 1. Check for the cookie!
    const userId = req.cookies.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized. Please log in first." });
    }

    // 2. Find the user securely from the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // 3. Extract data (Notice we don't get username from req.body anymore)
    const { post_type, post_txt, post_date } = req.body;
    let secure_url = "-";

    // 4. Handle Cloudinary
    if (req.file && post_type === "img") {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        folder: "socialfly_posts",
      });
      secure_url = uploadResponse.secure_url;
    }

    // 5. Save to MongoDB using the securely fetched username
    const newPost = new Post({
      post_type,
      post_txt: post_type === "txt" ? post_txt : "-",
      post_url: secure_url,
      user: user._id, // ✅ store reference
      post_date,
    });

    await newPost.save();
    res
      .status(201)
      .json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});



router.get("/all", async (req, res) => {
  try {
    const userId = req.cookies.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 1. Find the current user to access their friends array
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Create an array of allowed IDs (Your friends' IDs + Your own ID)
    // Fallback to an empty array just in case 'friends' is undefined on old test accounts
    const feedUserIds = [...(currentUser.friends || [])];

    // 3. Find posts authored ONLY by the people in that array
    const posts = await Post.find({
      user: { $in: feedUserIds },
    })
      .populate({
        path: "user",
        select: "username profileUrl",
        // 🔥 Strict filter: completely ignore users with null, empty, or blank-space usernames
        match: { 
          username: { $ne: null, $ne: "", $ne: " " }
        } 
      })
      .sort({ _id: -1 }); // Newest first

    // 4. Remove posts where populate failed (meaning it was ghost/test data)
    const filteredPosts = posts.filter(post => post.user !== null);

    res.status(200).json(filteredPosts);
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});
// 2. TOGGLE LIKE
router.post("/like/:postId", async (req, res) => {
  try {
    const userId = req.cookies.userId;
    const { postId } = req.params;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const index = post.likes.findIndex(
      (id) => id.toString() === userId
    );

    if (index === -1) {
      post.likes.push(new mongoose.Types.ObjectId(userId)); // ✅ ensure correct type
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();

    res.status(200).json({
      likes: post.likes.length,
      isLiked: index === -1,
    });
  } catch (error) {
    res.status(500).json({ error: "Like action failed" });
  }
});

// ==========================================
// 3. GET LIKED POSTS (For Settings Menu)
// ==========================================
router.get("/liked", async (req, res) => {
  try {
    const userId = req.cookies.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    // Find posts where this user's ID is inside the 'likes' array
    const likedPosts = await Post.find({ likes: userId })
      .populate({
        path: "user",
        select: "username profileUrl",
        // Keep our strict filter to avoid ghost data!
        match: { username: { $nin: [null, "", " "] } }
      })
      .sort({ _id: -1 }); // Newest first

    // Filter out any ghost posts where populate failed
    const cleanLikedPosts = likedPosts.filter(post => post.user !== null);

    res.status(200).json(cleanLikedPosts);
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    res.status(500).json({ error: "Failed to fetch liked posts." });
  }
});

// ==========================================
// 4. GET COMMENTS FOR A POST
// ==========================================
router.get("/comments/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Find the post and populate the 'user' field inside the 'comments' array
    const post = await Post.findById(postId).populate({
      path: "comments.user",
      select: "username profileUrl"
    });

    if (!post) return res.status(404).json({ error: "Post not found" });

    // Send back just the comments array
    res.status(200).json(post.comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// ==========================================
// 5. ADD A COMMENT
// ==========================================
router.post("/comment/:postId", async (req, res) => {
  try {
    const userId = req.cookies.userId;
    const { postId } = req.params;
    const { text, date } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!text) return res.status(400).json({ error: "Comment text is required" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // 1. Create the new comment object
    const newComment = {
      user: userId,
      text: text,
      date: date || new Date().toLocaleDateString() 
    };

    // 2. Push it into the post's comments array and save
    post.comments.push(newComment);
    await post.save();

    // 3. Populate the user info of this specific new comment before sending it back
    // This allows the frontend to immediately show the commenter's profile picture!
    await post.populate({
      path: "comments.user",
      select: "username profileUrl"
    });

    // Grab the last comment (the one we just added)
    const addedComment = post.comments[post.comments.length - 1];

    res.status(201).json(addedComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});
module.exports = router;
