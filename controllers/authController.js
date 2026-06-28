const bcrypt = require("bcryptjs");
const getUsersCollection = require("../collections/usersCollection");
const generateToken = require("../utils/generateToken");

// Handle Standard Registration
const registerUser = async (req, res) => {
  try {
    const { name, email, photoURL, password } = req.body;
    const usersCollection = await getUsersCollection();

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user object (default role is 'patient')
    const newUser = {
      name,
      email,
      photoURL,
      password: hashedPassword,
      role: "patient",
      status: "active",
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);
    const token = generateToken({
      id: result.insertedId,
      email: newUser.email,
      role: newUser.role,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        _id: result.insertedId,
        name,
        email,
        role: newUser.role,
        photoURL,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during registration" });
  }
};

// Handle Standard Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usersCollection = await getUsersCollection();

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Handle edge case where a Google-only user tries to login with a password
    if (!user.password) {
      return res
        .status(400)
        .json({ success: false, message: "Please login with Google" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during login" });
  }
};

// Handle Google Login
const googleLogin = async (req, res) => {
  try {
    const { name, email, photoURL } = req.body;
    const usersCollection = await getUsersCollection();

    let user = await usersCollection.findOne({ email });

    // If user doesn't exist, register them automatically
    if (!user) {
      const newUser = {
        name,
        email,
        photoURL,
        role: "patient",
        status: "active",
        createdAt: new Date(),
      };
      const result = await usersCollection.insertOne(newUser);
      user = { _id: result.insertedId, ...newUser };
    } else {
      const updates = {};
      if (!user.role) updates.role = "patient";
      if (!user.status) updates.status = "active";
      if (!user.photoURL && photoURL) updates.photoURL = photoURL;
      if (!user.name && name) updates.name = name;

      if (Object.keys(updates).length > 0) {
        await usersCollection.updateOne({ _id: user._id }, { $set: updates });
        user = { ...user, ...updates };
      }
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL,
      },
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during Google login" });
  }
};

module.exports = { registerUser, loginUser, googleLogin };
