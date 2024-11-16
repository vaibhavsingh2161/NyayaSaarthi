const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register User
const registerUser = async (req, res) => {
  const { name, phone, email, password, role, barCouncilRegNo } = req.body;

  try {
    // Validate required fields
    if (!name || !phone || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Validate Bar Council Registration Number if the role is 'advocate'
    if (role === "advocate") {
      if (!barCouncilRegNo) {
        return res
          .status(400)
          .json({
            message:
              "Bar Council Registration Number is required for advocates.",
          });
      }

      const existingAdvocate = await User.findOne({ barCouncilRegNo });
      if (existingAdvocate) {
        return res
          .status(400)
          .json({ message: "Bar Council Registration Number already exists." });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = await User.create({
      name,
      phone,
      email,
      password: hashedPassword,
      role,
      barCouncilRegNo: role === "advocate" ? barCouncilRegNo : undefined,
      isApproved: role === "advocate" ? false : true, // Advocates need admin approval
    });

    // Respond with user data and token
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Ensure the role matches
    if (role !== user.role) {
      return res
        .status(400)
        .json({ message: "Account doesn't exist with the selected role." });
    }

    // Check advocate approval status
    if (user.role === "advocate" && !user.isApproved) {
      return res.status(403).json({ message: "Advocate approval pending." });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Set token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days expiration
      sameSite: "Strict",
    });

    res.status(200).json({
      message: "User logged in successfully.",
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };
