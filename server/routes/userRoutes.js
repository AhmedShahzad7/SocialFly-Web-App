const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
const Post = require("../models/Post");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/profile", async (req, res) => {
  try {
    const userId = req.cookies.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const userPosts = await Post.find({ user: user._id })
      .populate("user", "username profileUrl")
      .sort({ _id: -1 });

    res.status(200).json({
      username: user.username,
      email: user.email,
      profileUrl: user.profileUrl || "",
      friendCount: user.friends ? user.friends.length : 0,
      postCount: userPosts.length,
      posts: userPosts,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile data." });
  }
});

router.put("/update", upload.single("profileImage"), async (req, res) => {
  try {
    const userId = req.cookies.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const { username } = req.body;

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: "Username is already taken." });
      }
      user.username = username;
    }

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        folder: "socialfly_profiles", 
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" }, 
        ],
      });

      user.profileUrl = uploadResponse.secure_url;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        username: user.username,
        profileUrl: user.profileUrl,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile." });
  }
});

router.get("/all", async (req, res) => {
  try {
    const currentUserId = req.cookies.userId;
    if (!currentUserId) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const currentUser = await User.findById(currentUserId);
    
    const users = await User.find(
      { _id: { $ne: currentUserId } }, 
      'username profileUrl'
    );

    const usersWithStatus = users.map(u => ({
      _id: u._id,
      username: u.username,
      profileUrl: u.profileUrl,
      isFriend: currentUser.friends.some(friendId => friendId.toString() === u._id.toString())
    }));

    res.status(200).json(usersWithStatus);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

router.post("/unfriend/:targetUsername", async (req, res) => {
  try {
    const currentUserId = req.cookies.userId;
    if (!currentUserId) return res.status(401).json({ error: "Unauthorized." });

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findOne({ username: req.params.targetUsername });

    if (!targetUser) return res.status(404).json({ error: "User not found." });

    currentUser.friends = currentUser.friends.filter(id => id.toString() !== targetUser._id.toString());
    
    targetUser.friends = targetUser.friends.filter(id => id.toString() !== currentUserId.toString());

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ message: `You are no longer friends with ${targetUser.username}.` });
  } catch (error) {
    console.error("Error unfriending:", error);
    res.status(500).json({ error: "Failed to unfriend." });
  }
});


router.post("/add-friend/:targetUsername", async (req, res) => {
  try {
    const currentUserId = req.cookies.userId;
    if (!currentUserId) return res.status(401).json({ error: "Unauthorized." });

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findOne({ username: req.params.targetUsername });

    if (!targetUser) return res.status(404).json({ error: "User not found." });

    if (!targetUser.friendRequests.includes(currentUser._id) && !targetUser.friends.includes(currentUser._id)) {
      targetUser.friendRequests.push(currentUser._id);
      await targetUser.save();
    }

    res.status(200).json({ message: "Friend request sent!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send request." });
  }
});

router.get("/notifications", async (req, res) => {
  try {
    const userId = req.cookies.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized." });

    const user = await User.findById(userId).populate("friendRequests", "username profileUrl");
    res.status(200).json(user.friendRequests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
});

router.post("/handle-request", async (req, res) => {
  try {
    const userId = req.cookies.userId;
    const { requesterId, action } = req.body; 
    
    if (!userId) return res.status(401).json({ error: "Unauthorized." });

    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);

    if (action === "accept") {
      if (!user.friends.includes(requesterId)) user.friends.push(requesterId);
      if (!requester.friends.includes(userId)) requester.friends.push(userId);
      await requester.save();
    }

    await user.save();
    res.status(200).json({ message: `Request ${action}ed.` });
  } catch (error) {
    res.status(500).json({ error: "Action failed." });
  }
});

router.get("/friends", async (req, res) => {
  try {
    const userId = req.cookies.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized." });

    const user = await User.findById(userId).populate("friends", "username profileUrl");
    
    if (!user) return res.status(404).json({ error: "User not found." });

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error fetching friend list:", error);
    res.status(500).json({ error: "Failed to fetch friend list." });
  }
});

module.exports = router;
