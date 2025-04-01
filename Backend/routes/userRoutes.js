const express = require("express");
const { 
  registerUser, 
  loginUser, 
  getCurrentUser 
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/me", protect, getCurrentUser);

// Add a logout route (optional, since we're handling logout in the frontend by removing the token)
router.post("/logout", (req, res) => {
  // In a stateless JWT authentication system, the server doesn't need to do anything
  // The client is responsible for removing the token from localStorage
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;