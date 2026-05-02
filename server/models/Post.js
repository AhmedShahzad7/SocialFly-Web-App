const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  post_type: { type: String, required: true },
  post_txt: { type: String, default: "-" },
  post_url: { type: String, default: "-" },

  // 🔥 Replace username with this:
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  post_date: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    date: { type: String, required: true }
  }]
  
});

module.exports = mongoose.model("Post", postSchema);