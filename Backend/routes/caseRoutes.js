// Backend/routes/caseRoutes.js
const express = require("express");
const {
  createCase,
  getUserCases,
  getCaseById,
  getDocument,
  getFloatingCases,
  submitBid,
  acceptBid,
  uploadDocument,
  getCaseDocuments,
  updateCaseStatus,
  deleteCase,
  requestAdvocate,
  toggleFloatingStatus
} = require("../controllers/caseController");
const { protect } = require("../middlewares/authMiddleware");
const multer = require("multer");

const router = express.Router();

// Configure multer for memory storage (files stored as buffers)
const storage = multer.memoryStorage();

// Initialize multer upload with file size limits
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // Accept common document formats
    const allowedMimeTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only document, image, and office files are allowed.'));
    }
  },
});

// Case routes
router.post("/create", protect, upload.array("documents", 5), createCase);
router.get("/my-cases", protect, getUserCases);
router.get("/case/:id", protect, getCaseById);
router.get("/case/:caseId/document/:documentId", (req, res, next) => {
    // If token is in query params, skip protect middleware
    if (req.query.token) {
        return next();
    }
    // Otherwise apply protect middleware
    return protect(req, res, next);
}, getDocument);
router.get("/floating", protect, getFloatingCases);
router.post("/submit-bid", protect, submitBid);
router.post("/accept-bid", protect, acceptBid);

// Direct advocate request route
router.post("/:caseId/request-advocate", protect, requestAdvocate);

// Document routes
router.post("/case/:caseId/documents", protect, upload.array("documents", 5), uploadDocument);
router.get("/case/:caseId/documents", protect, getCaseDocuments);

// Status update route
router.patch("/case/:caseId/status", protect, updateCaseStatus);

// Floating status update route
router.patch("/case/:caseId/floating", protect, toggleFloatingStatus);

// Delete case route
router.delete("/case/:caseId", protect, deleteCase);

module.exports = router;