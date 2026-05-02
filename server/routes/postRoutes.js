const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const Post = require("../models/Post");
const User = require("../models/User"); 
const mongoose = require("mongoose");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/create", upload.single("image"), async (req, res) => {
  try {
    const userId = req.cookies.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized. Please log in first." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const { post_type, post_txt, post_date } = req.body;
    let secure_url = "-";

    if (req.file && post_type === "img") {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        folder: "socialfly_posts",
      });
      secure_url = uploadResponse.secure_url;
    }

    const newPost = new Post({
      post_type,
      post_txt: post_type === "txt" ? post_txt : "-",
      post_url: secure_url,
      user: user._id,
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

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const feedUserIds = [...(currentUser.friends || [])];

    const posts = await Post.find({
      user: { $in: feedUserIds },
    })
      .populate({
        path: "user",
        select: "username profileUrl",
        match: { 
          username: { $ne: null, $ne: "", $ne: " " }
        } 
      })
      .sort({ _id: -1 }); 

    const filteredPosts = posts.filter(post => post.user !== null);

    res.status(200).json(filteredPosts);
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});
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
      post.likes.push(new mongoose.Types.ObjectId(userId));
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

router.get("/liked", async (req, res) => {
  try {
    const userId = req.cookies.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const likedPosts = await Post.find({ likes: userId })
      .populate({
        path: "user",
        select: "username profileUrl",
        match: { username: { $nin: [null, "", " "] } }
      })
      .sort({ _id: -1 }); 

    const cleanLikedPosts = likedPosts.filter(post => post.user !== null);

    res.status(200).json(cleanLikedPosts);
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    res.status(500).json({ error: "Failed to fetch liked posts." });
  }
});

router.get("/comments/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId).populate({
      path: "comments.user",
      select: "username profileUrl"
    });

    if (!post) return res.status(404).json({ error: "Post not found" });

    res.status(200).json(post.comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

router.post("/comment/:postId", async (req, res) => {
  try {
    const userId = req.cookies.userId;
    const { postId } = req.params;
    const { text, date } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!text) return res.status(400).json({ error: "Comment text is required" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const newComment = {
      user: userId,
      text: text,
      date: date || new Date().toLocaleDateString() 
    };

    post.comments.push(newComment);
    await post.save();

    await post.populate({
      path: "comments.user",
      select: "username profileUrl"
    });

    const addedComment = post.comments[post.comments.length - 1];

    res.status(201).json(addedComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});
module.exports = router;
