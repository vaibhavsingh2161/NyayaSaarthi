// Backend/controllers/caseController.js
const Case = require("../models/Case");
const User = require("../models/userModel");

// Update the createCase function in Backend/controllers/caseController.js

// Create a new case
const createCase = async (req, res) => {
    try {
        console.log("Create case request received");
        const { subject, description, caseType, isFloating } = req.body;
        const userId = req.user.id; // From auth middleware

        // Validate required fields
        if (!subject || !description || !caseType) {
            console.log("Validation failed - missing required fields");
            return res.status(400).json({ message: "Subject, description, and case type are required." });
        }

        // Process uploaded documents
        const documents = [];
        if (req.files && req.files.length > 0) {
            console.log("Processing files:", req.files.length);

            for (const file of req.files) {
                // Read file data into buffer
                const fileData = file.buffer;

                documents.push({
                    fileName: file.originalname,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    fileData: fileData
                });
            }
        }

        // Log case data before creating (exclude file data from log for clarity)
        const caseDataLog = {
            subject,
            description,
            caseType,
            user: userId,
            documentCount: documents.length,
            isFloating: isFloating === "true" || isFloating === true,
        };
        console.log("Creating case with data:", caseDataLog);

        // Create new case
        const newCase = await Case.create({
            subject,
            description,
            caseType,
            user: userId,
            documents,
            isFloating: isFloating === "true" || isFloating === true,
        });

        console.log("Case created with ID:", newCase._id);

        // Return success response
        res.status(201).json({
            success: true,
            case: {
                _id: newCase._id,
                subject: newCase.subject,
                caseType: newCase.caseType,
                status: newCase.status,
                isFloating: newCase.isFloating,
            },
            message: newCase.isFloating
                ? "Case has been successfully floated. Advocates will be able to bid on it."
                : "Case has been successfully created.",
        });
    } catch (error) {
        console.error("Error creating case:", error);
        res.status(500).json({ message: "Error creating case", error: error.message });
    }
};

// Get all cases for a user
const getUserCases = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = {};

        if (userRole === "plaintiff") {
            // If user is a plaintiff, show their cases
            query = { user: userId };
        } else if (userRole === "advocate") {
            // If user is an advocate, show cases assigned to them or floating cases
            query = {
                $or: [
                    { advocate: userId },
                    { isFloating: true }
                ]
            };
        }

        const cases = await Case.find(query)
            .populate("user", "name email")
            .populate("advocate", "name email")
            .sort({ createdAt: -1 })
            .select('-documents.fileData'); // Exclude the file data to reduce response size

        res.status(200).json({
            success: true,
            count: cases.length,
            cases,
        });
    } catch (error) {
        console.error("Error fetching cases:", error);
        res.status(500).json({ message: "Error fetching cases", error: error.message });
    }
};

// Get case details by ID
const getCaseById = async (req, res) => {
    try {
        const caseId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const caseDetails = await Case.findById(caseId)
            .populate("user", "name email phone")
            .populate("advocate", "name email phone")
            .select('-documents.fileData'); // Exclude file data to reduce response size

        // Check if case exists
        if (!caseDetails) {
            return res.status(404).json({ message: "Case not found" });
        }

        // Check if user has access to this case
        if (
            userRole === "plaintiff" &&
            caseDetails.user._id.toString() !== userId &&
            userRole === "advocate" &&
            (caseDetails.advocate?._id.toString() !== userId && !caseDetails.isFloating)
        ) {
            return res.status(403).json({ message: "You don't have access to this case" });
        }

        res.status(200).json({
            success: true,
            case: caseDetails,
        });
    } catch (error) {
        console.error("Error fetching case details:", error);
        res.status(500).json({ message: "Error fetching case details", error: error.message });
    }
};

// Get a specific document from a case
const getDocument = async (req, res) => {
    try {
        const { caseId, documentId } = req.params;
        const { view, token } = req.query; // Get token from query

        // Verify the token
        let userId;

        if (token) {
            try {
                // Verify the token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                // Get user from the token
                const user = await User.findById(decoded.id).select("-password");

                if (!user) {
                    return res.status(401).json({ message: "User not found" });
                }

                userId = user._id;
            } catch (err) {
                return res.status(401).json({ message: "Invalid token" });
            }
        } else if (req.user) {
            // If no token in query, try getting from auth middleware
            userId = req.user.id;
        } else {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        // Find the case
        const caseData = await Case.findById(caseId);

        if (!caseData) {
            return res.status(404).json({ message: "Case not found" });
        }

        // Check if user has access to this case
        if (
            caseData.user.toString() !== userId.toString() &&
            (caseData.advocate && caseData.advocate.toString() !== userId.toString())
        ) {
            return res.status(403).json({ message: "You don't have permission to access this document" });
        }

        // Find the specific document
        const document = caseData.documents.id(documentId);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Set response headers for file
        res.set({
            'Content-Type': document.fileType,
            'Content-Length': document.fileSize,
        });

        // If it's a view request, set Content-Disposition to inline, otherwise attachment
        if (view) {
            res.set('Content-Disposition', `inline; filename="${document.fileName}"`);
        } else {
            res.set('Content-Disposition', `attachment; filename="${document.fileName}"`);
        }

        // Send the file data
        res.send(document.fileData);

    } catch (error) {
        console.error("Error fetching document:", error);
        res.status(500).json({ message: "Error fetching document", error: error.message });
    }
};

// Get floating cases (for advocates)
const getFloatingCases = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Only advocates can view floating cases
        if (userRole !== "advocate") {
            return res.status(403).json({ message: "Only advocates can view floating cases" });
        }

        const floatingCases = await Case.find({
            isFloating: true,
            status: "pending"
        })
            .populate("user", "name")
            .select('-documents.fileData')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: floatingCases.length,
            cases: floatingCases,
        });
    } catch (error) {
        console.error("Error fetching floating cases:", error);
        res.status(500).json({ message: "Error fetching floating cases", error: error.message });
    }
};

// Submit a bid on a floating case (for advocates)
const submitBid = async (req, res) => {
    try {
        const { caseId, amount, message } = req.body;
        const advocateId = req.user.id;
        const userRole = req.user.role;

        // Validate required fields
        if (!caseId || !amount) {
            return res.status(400).json({ message: "Case ID and bid amount are required." });
        }

        // Only advocates can submit bids
        if (userRole !== "advocate") {
            return res.status(403).json({ message: "Only advocates can submit bids" });
        }

        const targetCase = await Case.findById(caseId);

        // Check if case exists and is floating
        if (!targetCase) {
            return res.status(404).json({ message: "Case not found" });
        }

        if (!targetCase.isFloating) {
            return res.status(400).json({ message: "This case is not open for bidding" });
        }

        // Check if advocate has already bid on this case
        const existingBid = targetCase.bids.find(
            (bid) => bid.advocate.toString() === advocateId
        );

        if (existingBid) {
            return res.status(400).json({ message: "You have already bid on this case" });
        }

        // Add the new bid
        targetCase.bids.push({
            advocate: advocateId,
            amount,
            message: message || "Interested in taking this case.",
        });

        await targetCase.save();

        res.status(200).json({
            success: true,
            message: "Your bid has been submitted successfully",
        });
    } catch (error) {
        console.error("Error submitting bid:", error);
        res.status(500).json({ message: "Error submitting bid", error: error.message });
    }
};

// Accept a bid (for plaintiffs)
const acceptBid = async (req, res) => {
    try {
        const { caseId, bidId } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Validate required fields
        if (!caseId || !bidId) {
            return res.status(400).json({ message: "Case ID and Bid ID are required." });
        }

        // Only plaintiffs can accept bids
        if (userRole !== "plaintiff") {
            return res.status(403).json({ message: "Only plaintiffs can accept bids" });
        }

        const targetCase = await Case.findById(caseId);

        // Check if case exists and belongs to the user
        if (!targetCase) {
            return res.status(404).json({ message: "Case not found" });
        }

        if (targetCase.user.toString() !== userId) {
            return res.status(403).json({ message: "You don't have permission to modify this case" });
        }

        // Find the selected bid
        const selectedBid = targetCase.bids.id(bidId);
        if (!selectedBid) {
            return res.status(404).json({ message: "Bid not found" });
        }

        // Update case status and assign advocate
        targetCase.isFloating = false;
        targetCase.status = "assigned";
        targetCase.advocate = selectedBid.advocate;

        await targetCase.save();

        res.status(200).json({
            success: true,
            message: "Bid accepted successfully. The advocate has been assigned to your case.",
        });
    } catch (error) {
        console.error("Error accepting bid:", error);
        res.status(500).json({ message: "Error accepting bid", error: error.message });
    }
};

// Upload document to case
const uploadDocument = async (req, res) => {
    try {
        const { caseId } = req.params;
        const userId = req.user.id;

        // Find the case
        const caseDetails = await Case.findById(caseId);

        if (!caseDetails) {
            return res.status(404).json({ message: "Case not found" });
        }

        // Check if user has access to this case
        if (
            caseDetails.user.toString() !== userId &&
            (caseDetails.advocate && caseDetails.advocate.toString() !== userId)
        ) {
            return res.status(403).json({ message: "You don't have permission to add documents to this case" });
        }

        // Process uploaded documents
        const documents = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // Read file data into buffer
                const fileData = file.buffer;

                // Add document to case
                caseDetails.documents.push({
                    fileName: file.originalname,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    fileData: fileData
                });
            }
        } else {
            return res.status(400).json({ message: "No files uploaded" });
        }

        // Save the case with new documents
        await caseDetails.save();

        // Return the document info without the file data
        const documentInfo = caseDetails.documents
            .slice(-req.files.length)
            .map(doc => ({
                _id: doc._id,
                fileName: doc.fileName,
                fileType: doc.fileType,
                fileSize: doc.fileSize,
                uploadDate: doc.uploadDate
            }));

        res.status(200).json({
            success: true,
            message: "Documents uploaded successfully",
            documents: documentInfo,
        });
    } catch (error) {
        console.error("Error uploading documents:", error);
        res.status(500).json({ message: "Error uploading documents", error: error.message });
    }
};

// Get all documents for a case (metadata only)
const getCaseDocuments = async (req, res) => {
    try {
        const { caseId } = req.params;
        const userId = req.user.id;

        // Find the case
        const caseDetails = await Case.findById(caseId).select('documents._id documents.fileName documents.fileType documents.fileSize documents.uploadDate user advocate');

        if (!caseDetails) {
            return res.status(404).json({ message: "Case not found" });
        }

        // Check if user has access to this case
        if (
            caseDetails.user.toString() !== userId &&
            (caseDetails.advocate && caseDetails.advocate.toString() !== userId)
        ) {
            return res.status(403).json({ message: "You don't have permission to view documents for this case" });
        }

        res.status(200).json({
            success: true,
            documents: caseDetails.documents,
        });
    } catch (error) {
        console.error("Error fetching case documents:", error);
        res.status(500).json({ message: "Error fetching case documents", error: error.message });
    }
};

// Delete a case
const deleteCase = async (req, res) => {
    try {
        const { caseId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Find the case
        const caseDetails = await Case.findById(caseId);

        if (!caseDetails) {
            return res.status(404).json({ message: "Case not found" });
        }

        // Check permissions - only the case creator (plaintiff) can delete a case
        if (caseDetails.user.toString() !== userId) {
            return res.status(403).json({
                message: "You don't have permission to delete this case"
            });
        }

        // Check if case has an assigned advocate
        if (caseDetails.advocate && caseDetails.status !== 'pending') {
            return res.status(400).json({
                message: "Cannot delete a case that has an assigned advocate and is in progress"
            });
        }

        // Delete the case
        await Case.findByIdAndDelete(caseId);

        res.status(200).json({
            success: true,
            message: "Case deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting case:", error);
        res.status(500).json({ message: "Error deleting case", error: error.message });
    }
};

// Update case status
const updateCaseStatus = async (req, res) => {
    try {
        const { caseId } = req.params;
        const { status } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Validate status
        const validStatuses = ["pending", "assigned", "in-progress", "closed"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        // Find the case
        const caseDetails = await Case.findById(caseId);

        if (!caseDetails) {
            return res.status(404).json({ message: "Case not found" });
        }

        // Check permissions based on role and status change
        if (userRole === "advocate" && caseDetails.advocate && caseDetails.advocate.toString() !== userId) {
            return res.status(403).json({ message: "You don't have permission to update this case" });
        }

        if (userRole === "plaintiff" && caseDetails.user.toString() !== userId) {
            return res.status(403).json({ message: "You don't have permission to update this case" });
        }

        // Apply status change
        caseDetails.status = status;
        await caseDetails.save();

        res.status(200).json({
            success: true,
            message: `Case status updated to ${status}`,
            case: {
                _id: caseDetails._id,
                subject: caseDetails.subject,
                status: caseDetails.status,
            },
        });
    } catch (error) {
        console.error("Error updating case status:", error);
        res.status(500).json({ message: "Error updating case status", error: error.message });
    }
};

module.exports = {
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
    deleteCase
};