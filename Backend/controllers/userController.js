const User = require("../models/userModel");
const AdvocateProfile = require("../models/advocateProfileModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register User
const registerUser = async (req, res) => {
  const { name, phone, email, password, role, additionalInfo } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user (basic user data)
    const user = await User.create({
      name,
      phone,
      email,
      password: hashedPassword,
      role,
      isApproved: role === "advocate" ? false : true, // Advocates need approval
    });

    // If the user is an advocate, create an AdvocateProfile
    if (role === "advocate") {
      const advocateProfile = new AdvocateProfile({
        user: user._id, // reference to the user
        languages: additionalInfo.languages,
        dateOfBirth: additionalInfo.dateOfBirth,
        location: additionalInfo.location,
        enrolmentNo: additionalInfo.enrolmentNo,
        barCouncilRegNo: additionalInfo.barCouncilRegNo,
        yearsOfExperience: additionalInfo.yearsOfExperience,
        education: additionalInfo.education.map((edu) => ({
          degree: edu.degree,
          institution: edu.institution,
          yearOfPassing: edu.yearOfPassing,
          extraCourses: edu.extraCourses,
        })),
        workExperience: additionalInfo.workExperience.map((work) => ({
          firmName: work.firmName,
          startDate: work.startDate,
          endDate: work.endDate,
          briefDescription: work.briefDescription,
        })),
        specialisations: additionalInfo.specialisations,
        casesHandled: additionalInfo.casesHandled,
        description: additionalInfo.description,
        preferredClientele: additionalInfo.preferredClientele,
        courts: additionalInfo.courts,
      });

      await advocateProfile.save();
    }


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
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if the advocate's approval is pending
    if (user.role === "advocate" && !user.isApproved) {
      return res.status(403).json({ message: "Advocate approval pending" });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Set token as a cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevents access from JavaScript
      secure: process.env.NODE_ENV === "production", // Sends cookie over HTTPS in production
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days expiration
      sameSite: "Strict", // Mitigates CSRF attacks
    });

    res.status(200).json({
      message: "User logged in successfully",
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




