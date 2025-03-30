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

module.exports = router;