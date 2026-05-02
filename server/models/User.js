const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // ---> ADD THIS LINE <---
  profileUrl: { type: String, default: "" }, 
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // (If you have a friends array, make sure that's here too!)
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
});

module.exports = mongoose.model("User", UserSchema);