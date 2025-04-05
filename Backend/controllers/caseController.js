// Backend/controllers/caseController.js
const Case = require("../models/Case");
const User = require("../models/userModel");


const createCase = async (req, res) => {
    try {
        console.log("Create case request received");
        const { subject, description, caseType, isFloating } = req.body;
        const userId = req.user.id; 

        if (!subject || !description || !caseType) {
            console.log("Validation failed - missing required fields");
            return res.status(400).json({ message: "Subject, description, and case type are required." });
        }

        const documents = [];
        if (req.files && req.files.length > 0) {
            console.log("Processing files:", req.files.length);

            for (const file of req.files) {
                const fileData = file.buffer;

                documents.push({
                    fileName: file.originalname,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    fileData: fileData
                });
            }
        }

        const caseDataLog = {
            subject,
            description,
            caseType,
            user: userId,
            documentCount: documents.length,
            isFloating: isFloating === "true" || isFloating === true,
        };
        console.log("Creating case with data:", caseDataLog);

        const newCase = await Case.create({
            subject,
            description,
            caseType,
            user: userId,
            documents,
            isFloating: isFloating === "true" || isFloating === true,
        });

        console.log("Case created with ID:", newCase._id);

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


const getUserCases = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log(`[getUserCases] User ID: ${userId}, Role: ${userRole}`);

        let query = {};
        
        if (userRole === "plaintiff") {
            
            const userIdStr = userId.toString();
            query = { user: userId };
            
            console.log(`[getUserCases] Plaintiff query: { user: ${userIdStr} }`);
            
            const sampleCases = await Case.find().limit(3).select('_id user');
            console.log('[getUserCases] Sample cases in DB:', 
                sampleCases.map(c => ({ 
                    id: c._id.toString(), 
                    user: c.user.toString(),
                    isMatch: c.user.toString() === userIdStr
                }))
            );
            
        } else if (userRole === "advocate") {
            query = { advocate: userId };
            console.log(`[getUserCases] Advocate query: { advocate: ${userId.toString()} }`);
        } else {
            console.log(`[getUserCases] Unknown role: ${userRole}`);
            return res.status(403).json({ 
                success: false, 
                message: "Role not authorized to view cases" 
            });
        }

        const cases = await Case.find(query)
            .populate("user", "name email")
            .populate("advocate", "name email")
            .sort({ createdAt: -1 })
            .select('-documents.fileData');

        console.log(`[getUserCases] Found ${cases.length} cases for user ${userId}`);
        
        if (userRole === "plaintiff" && cases.length > 0) {
            console.log('[getUserCases] First few case details:',
                cases.slice(0, 2).map(c => ({
                    id: c._id.toString(),
                    subject: c.subject,
                    user: c.user._id.toString(),
                    userMatches: c.user._id.toString() === userId.toString()
                }))
            );
        }

        return res.status(200).json({
            success: true,
            count: cases.length,
            cases,
        });
    } catch (error) {
        console.error("[getUserCases] Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching cases", 
            error: error.message 
        });
    }
};


const getCaseById = async (req, res) => {
    try {
        const caseId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;
        
        console.log(`[getCaseById] Fetching case ID: ${caseId} for user: ${userId}, role: ${userRole}`);

        const caseDetails = await Case.findById(caseId)
            .populate("user", "name email phone")
            .populate("advocate", "name email phone")
            .populate("pendingAdvocate", "name email phone")
            .select('-documents.fileData');

        if (!caseDetails) {
            console.log(`[getCaseById] Case not found with ID: ${caseId}`);
            return res.status(404).json({ 
                success: false,
                message: "Case not found" 
            });
        }
        
        console.log(`[getCaseById] Case found: 
            Owner: ${caseDetails.user?._id}
            Advocate: ${caseDetails.advocate?._id}
            Pending Advocate: ${caseDetails.pendingAdvocate?._id}
            Status: ${caseDetails.status}
            Request Status: ${caseDetails.requestStatus}
        `);

        let hasAccess = false;
        
        if (userRole === "plaintiff") {
            hasAccess = caseDetails.user._id.toString() === userId;
            console.log(`[getCaseById] Plaintiff access check: ${hasAccess}`);
        } 
        else if (userRole === "advocate") {
            const isAssignedAdvocate = caseDetails.advocate && caseDetails.advocate._id.toString() === userId;
            const isPendingAdvocate = caseDetails.pendingAdvocate && caseDetails.pendingAdvocate._id.toString() === userId;
            const isCaseFloating = caseDetails.isFloating;
            
            hasAccess = isAssignedAdvocate || isPendingAdvocate || isCaseFloating;
            
            console.log(`[getCaseById] Advocate access check: 
                Is Assigned: ${isAssignedAdvocate} 
                Is Pending: ${isPendingAdvocate} 
                Is Floating: ${isCaseFloating}
                Has Access: ${hasAccess}`);
        }
        
        if (!hasAccess) {
            console.log(`[getCaseById] Access denied for user ${userId} to case ${caseId}`);
            return res.status(403).json({ 
                success: false,
                message: "You don't have access to this case" 
            });
        }

        if (caseDetails.advocate) {
            const AdvocateDetails = require('../models/AdvocateDetails');
            try {
                const advocateProfile = await AdvocateDetails.findOne({ 
                    userId: caseDetails.advocate._id 
                });
                
                if (advocateProfile) {
                    caseDetails.advocate = {
                        ...caseDetails.advocate.toObject(),
                        profilePicture: advocateProfile.profilePicture,
                        location: advocateProfile.location,
                        yearsOfExperience
                    };
                    
                    console.log(`[getCaseById] Added advocate profile details including picture: ${advocateProfile.profilePicture}`);
                }
            } catch (error) {
                console.error("[getCaseById] Error fetching advocate details:", error);
            }
        }

        console.log(`[getCaseById] Access granted for user ${userId} to case ${caseId}`);
        return res.status(200).json({
            success: true,
            case: caseDetails,
        });
    } catch (error) {
        console.error("[getCaseById] Error:", error);
        return res.status(500).json({ 
            success: false,
            message: "Error fetching case details", 
            error: error.message 
        });
    }
};


const getDocument = async (req, res) => {
    try {
        const { caseId, documentId } = req.params;
        const { view, token } = req.query; 

        let userId;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                const user = await User.findById(decoded.id).select("-password");

                if (!user) {
                    return res.status(401).json({ message: "User not found" });
                }

                userId = user._id;
            } catch (err) {
                return res.status(401).json({ message: "Invalid token" });
            }
        } else if (req.user) {
            userId = req.user.id;
        } else {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const caseData = await Case.findById(caseId);

        if (!caseData) {
            return res.status(404).json({ message: "Case not found" });
        }

        if (
            caseData.user.toString() !== userId.toString() &&
            (caseData.advocate && caseData.advocate.toString() !== userId.toString())
        ) {
            return res.status(403).json({ message: "You don't have permission to access this document" });
        }

        const document = caseData.documents.id(documentId);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        res.set({
            'Content-Type': document.fileType,
            'Content-Length': document.fileSize,
        });

        if (view) {
            res.set('Content-Disposition', `inline; filename="${document.fileName}"`);
        } else {
            res.set('Content-Disposition', `attachment; filename="${document.fileName}"`);
        }

        res.send(document.fileData);

    } catch (error) {
        console.error("Error fetching document:", error);
        res.status(500).json({ message: "Error fetching document", error: error.message });
    }
};


const getFloatingCases = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

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


const submitBid = async (req, res) => {
    try {
        const { caseId, amount, message } = req.body;
        const advocateId = req.user.id;
        const userRole = req.user.role;

        if (!caseId || !amount) {
            return res.status(400).json({ message: "Case ID and bid amount are required." });
        }

        if (userRole !== "advocate") {
            return res.status(403).json({ message: "Only advocates can submit bids" });
        }

        const targetCase = await Case.findById(caseId);

        if (!targetCase) {
            return res.status(404).json({ message: "Case not found" });
        }

        if (!targetCase.isFloating) {
            return res.status(400).json({ message: "This case is not open for bidding" });
        }

        const existingBid = targetCase.bids.find(
            (bid) => bid.advocate.toString() === advocateId
        );

        if (existingBid) {
            return res.status(400).json({ message: "You have already bid on this case" });
        }

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


const acceptBid = async (req, res) => {
    try {
        const { caseId, bidId } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!caseId || !bidId) {
            return res.status(400).json({ message: "Case ID and Bid ID are required." });
        }

        if (userRole !== "plaintiff") {
            return res.status(403).json({ message: "Only plaintiffs can accept bids" });
        }

        const targetCase = await Case.findById(caseId);

        if (!targetCase) {
            return res.status(404).json({ message: "Case not found" });
        }

        if (targetCase.user.toString() !== userId) {
            return res.status(403).json({ message: "You don't have permission to modify this case" });
        }

        const selectedBid = targetCase.bids.id(bidId);
        if (!selectedBid) {
            return res.status(404).json({ message: "Bid not found" });
        }

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


const uploadDocument = async (req, res) => {
    try {
        const { caseId } = req.params;
        const userId = req.user.id;

        const caseDetails = await Case.findById(caseId);

        if (!caseDetails) {
            return res.status(404).json({ message: "Case not found" });
        }

        if (
            caseDetails.user.toString() !== userId &&
            (caseDetails.advocate && caseDetails.advocate.toString() !== userId)
        ) {
            return res.status(403).json({ message: "You don't have permission to add documents to this case" });
        }

        const documents = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const fileData = file.buffer;

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

        await caseDetails.save();

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


const getCaseDocuments = async (req, res) => {
    try {
        const { caseId } = req.params;
        const userId = req.user.id;

        const caseDetails = await Case.findById(caseId).select('documents._id documents.fileName documents.fileType documents.fileSize documents.uploadDate user advocate');

        if (!caseDetails) {
            return res.status(404).json({ message: "Case not found" });
        }

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

const deleteCase = async (req, res) => {
    try {
        const { caseId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const caseDetails = await Case.findById(caseId);

        if (!caseDetails) {
            return res.status(404).json({ message: "Case not found" });
        }

        if (caseDetails.user.toString() !== userId) {
            return res.status(403).json({
                message: "You don't have permission to delete this case"
            });
        }

        if (caseDetails.advocate && caseDetails.status !== 'pending') {
            return res.status(400).json({
                message: "Cannot delete a case that has an assigned advocate and is in progress"
            });
        }

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

const updateCaseStatus = async (req, res) => {
    try {
        const { caseId } = req.params;
        const { status } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        const validStatuses = ["pending", "assigned", "in-progress", "closed"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const caseDetails = await Case.findById(caseId);

        if (!caseDetails) {
            return res.status(404).json({ message: "Case not found" });
        }

        if (userRole === "advocate" && caseDetails.advocate && caseDetails.advocate.toString() !== userId) {
            return res.status(403).json({ message: "You don't have permission to update this case" });
        }

        if (userRole === "plaintiff" && caseDetails.user.toString() !== userId) {
            return res.status(403).json({ message: "You don't have permission to update this case" });
        }

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

const requestAdvocate = async (req, res) => {
    try {
        const { caseId } = req.params;
        const { advocateId } = req.body;
        const userId = req.user.id; 
        
        console.log(`[requestAdvocate] Case ID: ${caseId}, Advocate ID: ${advocateId}, User ID: ${userId.toString()}`);

        if (!advocateId) {
            return res.status(400).json({ 
                success: false,
                message: "Advocate ID is required." 
            });
        }

        const targetCase = await Case.findById(caseId);

        if (!targetCase) {
            console.log(`[requestAdvocate] Case not found with ID: ${caseId}`);
            return res.status(404).json({ 
                success: false,
                message: "Case not found" 
            });
        }

        const caseOwnerId = targetCase.user?.toString();
        const requestingUserId = userId.toString();
        console.log(`[requestAdvocate] Case Owner ID: ${caseOwnerId}, Requesting User ID: ${requestingUserId}`);
        console.log(`[requestAdvocate] IDs match? ${caseOwnerId === requestingUserId}`);

        if (caseOwnerId !== requestingUserId) {
            return res.status(403).json({ 
                success: false,
                message: "You do not have permission to modify this case." 
            });
        }

        if (targetCase.advocate) {
            console.log(`[requestAdvocate] Case already has advocate assigned: ${targetCase.advocate.toString()}`);
            return res.status(400).json({ 
                success: false,
                message: "Case already has an advocate assigned." 
            });
        }

        if (targetCase.pendingAdvocate) {
            console.log(`[requestAdvocate] Case already has pending request to advocate: ${targetCase.pendingAdvocate.toString()}`);
            return res.status(400).json({ 
                success: false,
                message: "Case already has a pending advocate request." 
            });
        }

        const advocateUser = await User.findById(advocateId);
        if (!advocateUser) {
            console.log(`[requestAdvocate] Advocate not found with ID: ${advocateId}`);
            return res.status(404).json({ 
                success: false,
                message: "Advocate not found." 
            });
        }
        
        if (advocateUser.role !== 'advocate') {
            console.log(`[requestAdvocate] User is not an advocate. Role: ${advocateUser.role}`);
            return res.status(400).json({ 
                success: false,
                message: "Selected user is not an advocate." 
            });
        }

        targetCase.pendingAdvocate = advocateId;
        targetCase.requestStatus = 'pending';
        await targetCase.save();

        console.log(`[requestAdvocate] Request saved successfully for case ${caseId} to advocate ${advocateId}`);

        return res.status(200).json({
            success: true,
            message: `Request sent to advocate ${advocateUser.name} successfully.`,
        });

    } catch (error) {
        console.error("[requestAdvocate] Error:", error);
        return res.status(500).json({ 
            success: false,
            message: "Error requesting advocate", 
            error: error.message 
        });
    }
};

const toggleFloatingStatus = async (req, res) => {
    try {
        const { caseId } = req.params;
        const { isFloating } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log(`[toggleFloatingStatus] Case ID: ${caseId}, User ID: ${userId}, isFloating: ${isFloating}`);

        if (userRole !== "plaintiff") {
            console.log(`[toggleFloatingStatus] User role ${userRole} not authorized`);
            return res.status(403).json({
                success: false,
                message: "Only plaintiffs can make a case floating"
            });
        }

        const caseDetails = await Case.findById(caseId);

        if (!caseDetails) {
            console.log(`[toggleFloatingStatus] Case not found: ${caseId}`);
            return res.status(404).json({
                success: false,
                message: "Case not found"
            });
        }

        if (caseDetails.user.toString() !== userId) {
            console.log(`[toggleFloatingStatus] User ${userId} not owner of case ${caseId}`);
            return res.status(403).json({
                success: false,
                message: "You don't have permission to modify this case"
            });
        }

        if (isFloating && caseDetails.advocate) {
            console.log(`[toggleFloatingStatus] Case ${caseId} already has advocate assigned`);
            return res.status(400).json({
                success: false,
                message: "Cannot make a case floating when an advocate is already assigned"
            });
        }

        caseDetails.isFloating = isFloating;
        await caseDetails.save();

        console.log(`[toggleFloatingStatus] Case ${caseId} floating status updated to ${isFloating}`);
        return res.status(200).json({
            success: true,
            message: `Case is now ${isFloating ? 'floating' : 'not floating'}`,
            case: {
                _id: caseDetails._id,
                subject: caseDetails.subject,
                isFloating: caseDetails.isFloating
            }
        });
    } catch (error) {
        console.error("[toggleFloatingStatus] Error:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating case floating status",
            error: error.message
        });
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
    deleteCase,
    requestAdvocate,
    toggleFloatingStatus
};