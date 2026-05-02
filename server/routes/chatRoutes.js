const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const Post = require("../models/Post");
const User = require("../models/User"); 
const mongoose = require("mongoose");
const Message = require("../models/Message"); 

router.get("/chats/inbox", async (req, res) => {
  try {
    const userId = req.cookies.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized." });

    const user = await User.findById(userId).populate("friends", "username profileUrl status");
    if (!user) return res.status(404).json({ error: "User not found." });

    const inbox = await Promise.all(
      user.friends.map(async (friend) => {
        const lastMessage = await Message.findOne({
          $or: [
            { sender: userId, receiver: friend._id },
            { sender: friend._id, receiver: userId }
          ]
        }).sort({ timestamp: -1 }); 

        const unreadCount = await Message.countDocuments({
          sender: friend._id,
          receiver: userId,
          read: false
        });

        return {
          id: friend._id,
          username: friend.username,
          avatar: friend.profileUrl || "https://i.pravatar.cc/150", 
          status: friend.status || "Offline",
          lastMessage: lastMessage ? lastMessage.text : "Start a conversation!",
          timestamp: lastMessage ? lastMessage.timestamp : null,
          unread: unreadCount
        };
      })
    );

    
    inbox.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json(inbox);
  } catch (error) {
    console.error("Error fetching inbox:", error);
    res.status(500).json({ error: "Failed to fetch inbox." });
  }
});

router.get("/chats/:friendId", async (req, res) => {
  try {
    const userId = req.cookies.userId;
    const { friendId } = req.params;
    if (!userId) return res.status(401).json({ error: "Unauthorized." });

    await Message.updateMany(
      { sender: friendId, receiver: userId, read: false },
      { $set: { read: true } }
    );

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId }
      ]
    }).sort({ timestamp: 1 }); 

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});

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

module.exports = router;