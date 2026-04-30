const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://AhmedShahzad7:SocialFly%402026@socialflycluster.o3zhpjd.mongodb.net/?appName=SocialFlyCluster")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err));

app.use("/api/auth", authRoutes);
app.get("/test", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.listen(5000, () => console.log("Server running"));