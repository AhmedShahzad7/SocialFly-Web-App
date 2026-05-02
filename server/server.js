const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes"); 
const chatRoutes = require("./routes/chatRoutes"); 

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true, 
}));

app.use(express.json());
app.use(cookieParser()); 

mongoose.connect("mongodb+srv://AhmedShahzad7:SocialFly%402026@socialflycluster.o3zhpjd.mongodb.net/?appName=SocialFlyCluster")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes); 
app.use("/api", chatRoutes); 

app.listen(5000, () => console.log("Server running"));