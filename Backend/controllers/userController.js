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
    console.log("Register request received:", req.body);
    
    // Validate required fields
    if (!name || !phone || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    // Check if phone number is already used
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: "Phone number already in use." });
    }

    // Create user object
    const userData = {
      name,
      phone,
      email,
      password: await bcrypt.hash(password, 10), // Hash the password
      role,
      isApproved: role === "advocate" ? false : true, // Advocates need admin approval
    };
    
    // Only add barCouncilRegNo field for advocates
    if (role === "advocate") {
      if (!barCouncilRegNo) {
        return res.status(400).json({
          message: "Bar Council Registration Number is required for advocates."
        });
      }
      
      // Check if Bar Council Reg No already exists
      const existingAdvocate = await User.findOne({ barCouncilRegNo });
      if (existingAdvocate) {
        return res.status(400).json({ 
          message: "Bar Council Registration Number already exists." 
        });
      }
      
      userData.barCouncilRegNo = barCouncilRegNo;
    }

    // Create a new user
    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user.id);

    // Respond with user data and token
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password, role } = req.body;
  
  try {
    console.log("Login request received:", req.body);
    
    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    
    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
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

    // Return the response
    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getCurrentUser };