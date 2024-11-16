const express = require("express");
const { registerUser, loginUser } = require("../controllers/userController");
// const {
//   registerUser,
//   updateAdvocateInfo,
// } = require("../controllers/userController");
const router = express.Router();

router.post("/register", registerUser); // Route for registering users
// router.post("/register", registerUser); // POST request for user registration
// router.post("/updateAdvocateInfo", updateAdvocateInfo);
router.post("/login", loginUser); // Route for logging in users

module.exports = router;
