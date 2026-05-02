const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const Post = require("../models/Post");
const User = require("../models/User"); // <-- Import your User model
const mongoose = require("mongoose");
const Message = require("../models/Message"); // 🔥 ADD THIS

// 1. GET INBOX (Recent Chats for ChatPage.jsx)
// ==========================================
router.get("/chats/inbox", async (req, res) => {
  try {
    const userId = req.cookies.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized." });

    // 1. Get the user's friends list
    const user = await User.findById(userId).populate("friends", "username profileUrl status");
    if (!user) return res.status(404).json({ error: "User not found." });

    // 2. Loop through friends to find the latest message for each
    const inbox = await Promise.all(
      user.friends.map(async (friend) => {
        // Find the most recent message between the logged-in user and this friend
        const lastMessage = await Message.findOne({
          $or: [
            { sender: userId, receiver: friend._id },
            { sender: friend._id, receiver: userId }
          ]
        }).sort({ timestamp: -1 }); // Sort by newest first

        // Count unread messages from this friend
        const unreadCount = await Message.countDocuments({
          sender: friend._id,
          receiver: userId,
          read: false
        });

        return {
          id: friend._id,
          username: friend.username,
          avatar: friend.profileUrl || "https://i.pravatar.cc/150", // Fallback avatar
          status: friend.status || "Offline",
          lastMessage: lastMessage ? lastMessage.text : "Start a conversation!",
          timestamp: lastMessage ? lastMessage.timestamp : null,
          unread: unreadCount
        };
      })
    );

    // Filter out friends you haven't messaged yet (optional) 
    // const activeChats = inbox.filter(chat => chat.timestamp !== null);
    
    // Sort inbox so the most recent chats appear at the top
    inbox.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json(inbox);
  } catch (error) {
    console.error("Error fetching inbox:", error);
    res.status(500).json({ error: "Failed to fetch inbox." });
  }
});

// ==========================================
// 2. GET DM THREAD (Message history with a specific friend)
// ==========================================
router.get("/chats/:friendId", async (req, res) => {
  try {
    const userId = req.cookies.userId;
    const { friendId } = req.params;
    if (!userId) return res.status(401).json({ error: "Unauthorized." });

    // Mark all unread messages from this friend as "read" since we opened the chat
    await Message.updateMany(
      { sender: friendId, receiver: userId, read: false },
      { $set: { read: true } }
    );

    // Fetch the conversation history
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId }
      ]
    }).sort({ timestamp: 1 }); // Oldest first, so it reads top-to-bottom

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});

// ==========================================
// 3. SEND A MESSAGE
// ==========================================
router.post("/chats/send", async (req, res) => {
  try {
    const userId = req.cookies.userId;
    const { receiverId, text } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized." });
    if (!text || !text.trim()) return res.status(400).json({ error: "Message cannot be empty." });

    const newMessage = new Message({
      sender: userId,
      receiver: receiverId,
      text: text.trim()
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
});

// At the very bottom of chatRoutes.js
module.exports = router;