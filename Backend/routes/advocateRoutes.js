// routes/advocateRoutes.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer'); // Import multer
const path = require('path'); // Import path
// const cors = require('cors'); // REMOVE cors import
const AdvocateDetails = require('../models/AdvocateDetails');
const { protect, advocateOnly } = require('../middlewares/authMiddleware'); // Import protect and advocateOnly middleware
const {
    getPendingCaseRequests,
    acceptCaseRequest,
    denyCaseRequest,
} = require('../controllers/advocateController'); // Import advocate-specific case controllers

// REMOVE CORS options and middleware application for this router
// const corsOptions = {
//   origin: "http://localhost:3000", // Your frontend URL
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Authorization"],
//   optionsSuccessStatus: 200
// };
// router.use(cors(corsOptions));
// router.options('*', cors(corsOptions));

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure 'uploads/' directory exists in Backend
  },
  filename: function (req, file, cb) {
    // Create a unique filename to prevent overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage }); // Initialize multer with the storage configuration

// Middleware to verify JWT and ensure user is an advocate
const verifyAdvocateToken = (req, res, next) => {
    protect(req, res, () => {
        advocateOnly(req, res, next);
    });
};

// POST route for creating advocate profile - Use multer middleware for single file upload
router.post('/createProfile', protect, advocateOnly, upload.single('profilePicture'), async (req, res) => {
  // Text fields are now in req.body, file info is in req.file
  const {
    languages, // Sent as JSON string
    dob,
    location,
    // profilePicture is handled by multer, path stored in req.file.path
    enrolmentNo,
    barCouncilRegNo,
    yearsOfExperience,
    education, // Sent as JSON string
    workExperience, // Sent as JSON string
    specialisation, // Sent as JSON string
    casesHandled, // Sent as JSON string
    description,
    clientele, // Sent as JSON string
    courts // Sent as JSON string
  } = req.body;

  const profilePicturePath = req.file ? req.file.path : null; // Get file path if uploaded

  try {
    // Check if the user already has a profile
    const existingProfile = await AdvocateDetails.findOne({ userId: req.user.id });
    if (existingProfile) {
      return res.status(400).send('Profile already exists for this user');
    }

    // Parse JSON string fields back into arrays/objects
    const parsedLanguages = JSON.parse(languages || '[]');
    const parsedEducation = JSON.parse(education || '[]');
    const parsedWorkExperience = JSON.parse(workExperience || '[]');
    const parsedSpecialisation = JSON.parse(specialisation || '[]');
    const parsedCasesHandled = JSON.parse(casesHandled || '[]');
    const parsedClientele = JSON.parse(clientele || '[]');
    const parsedCourts = JSON.parse(courts || '[]');


    // Create a new advocate profile
    const advocateDetails = new AdvocateDetails({
      userId: req.user.id,
      languages: parsedLanguages,
      dob,
      location,
      profilePicture: profilePicturePath, // Store the file path
      enrolmentNo,
      barCouncilRegNo,
      yearsOfExperience,
      education: parsedEducation,
      workExperience: parsedWorkExperience,
      specialisation: parsedSpecialisation,
      casesHandled: parsedCasesHandled,
      description,
      clientele: parsedClientele,
      courts: parsedCourts
    });

    // Save advocate details to the database
    await advocateDetails.save();

    res.status(201).json({ message: 'Advocate profile created successfully', profile: advocateDetails }); // Send back created profile
  } catch (error) {
    console.error("Error creating profile:", error); // Log detailed error
    // Handle potential JSON parsing errors
    if (error instanceof SyntaxError) {
        return res.status(400).send('Invalid JSON format in form data.');
    }
    res.status(500).send('Server error');
  }
});

// GET route to fetch advocate profile details
router.get('/profile', protect, advocateOnly, async (req, res) => {
  try {
    // Find the advocate profile and populate the userId field to get user details
    const advocateProfile = await AdvocateDetails.findOne({ userId: req.user.id }).populate('userId', 'name email phone role barCouncilRegNo');

    if (!advocateProfile) {
      return res.status(404).send('Advocate profile not found for this user.');
    }

    // Return combined data
    res.status(200).json(advocateProfile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).send('Server error fetching profile details.');
  }
});

// PUT route to update advocate profile
router.put('/profile', protect, advocateOnly, async (req, res) => {
  try {
    // Find the advocate profile to update
    const advocateProfile = await AdvocateDetails.findOne({ userId: req.user.id });

    if (!advocateProfile) {
      return res.status(404).send('Advocate profile not found for this user.');
    }

    // Update fields that are provided in the request
    const updateFields = [
      'languages', 'dob', 'location', 'enrolmentNo', 'barCouncilRegNo', 
      'yearsOfExperience', 'education', 'workExperience', 'specialisation', 
      'casesHandled', 'description', 'clientele', 'courts'
    ];
    
    // Only update fields that are included in the request
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        advocateProfile[field] = req.body[field];
      }
    });

    // Save the updated profile
    await advocateProfile.save();

    // Return the updated profile
    res.status(200).json({ 
      message: 'Profile updated successfully', 
      profile: advocateProfile 
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).send('Server error updating profile details.');
  }
});

// GET route to fetch a list of all advocate profiles (public route, no token needed)
router.get('/list', async (req, res) => {
  try {
    // Find all advocate profiles and populate the userId field to get user details (name, etc.)
    // Select only necessary fields to keep the response size manageable
    const advocates = await AdvocateDetails.find({})
      .populate('userId', 'name') // Only populate the 'name' field from the User model
      .select('userId location profilePicture yearsOfExperience specialisation languages'); // Select specific fields

    if (!advocates || advocates.length === 0) {
      return res.status(404).send('No advocate profiles found.');
    }

    // Return the list of advocates
    res.status(200).json(advocates);
  } catch (error) {
    console.error("Error fetching advocate list:", error);
    res.status(500).send('Server error fetching advocate list.');
  }
});

// --- Case Request Routes ---

// GET route for advocates to see their pending case requests
router.get('/case-requests', protect, advocateOnly, getPendingCaseRequests);

// POST route for advocates to accept a case request
router.post('/accept-case', protect, advocateOnly, acceptCaseRequest);

// POST route for advocates to deny a case request
router.post('/deny-case', protect, advocateOnly, denyCaseRequest);

module.exports = router;
