const bcrypt = require("bcrypt");
const User = require("../models/User");

exports.login = async (req, res) => {
  console.log("REQ BODY:", req.body);

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  console.log("USER:", user);
  console.log("PASSWORD INPUT:", `"${password}"`);
  console.log("PASSWORD LENGTH:", password?.length);

  const isMatch = await bcrypt.compare(password, user.password);

  console.log("MATCH RESULT:", isMatch);
  res.cookie("userId", user._id, {
    httpOnly: true,        
    secure: true,          
    sameSite: "none",      
    maxAge: 24 * 60 * 60 * 1000 
  });

  res.json({ user });
};

exports.signup = async (req, res) => {
  const { fullname, username, email, password } = req.body;

  try {
    // check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email or Username already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullname,
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.cookie("userId", user._id, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000 
    });

    res.json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};