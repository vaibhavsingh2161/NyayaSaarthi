const Case = require("../models/Case");
const User = require("../models/userModel");

// Get pending case requests for the logged-in advocate
const getPendingCaseRequests = async (req, res) => {
    try {
        const advocateId = req.user.id; // Advocate's ID from token
        const advocateIdStr = advocateId.toString();
        
        console.log(`[getPendingCaseRequests] Advocate ID: ${advocateIdStr}`);

        // DEBUG: Check a few cases with pendingAdvocate to verify data
        const sampleRequests = await Case.find({ 
            requestStatus: "pending" 
        }).limit(3).select('_id pendingAdvocate');
        
        if (sampleRequests.length > 0) {
            console.log('[getPendingCaseRequests] Sample pending requests:', 
                sampleRequests.map(c => ({ 
                    id: c._id.toString(), 
                    pendingAdvocate: c.pendingAdvocate ? c.pendingAdvocate.toString() : null,
                    isMatch: c.pendingAdvocate ? c.pendingAdvocate.toString() === advocateIdStr : false
                }))
            );
        }

        // Main query for this advocate's pending requests
        const pendingCases = await Case.find({
            pendingAdvocate: advocateId,
            requestStatus: "pending",
        })
            .populate("user", "name email phone") // Get more plaintiff info
            .select("-documents.fileData") // Exclude file data
            .sort({ createdAt: -1 });

        console.log(`[getPendingCaseRequests] Found ${pendingCases.length} pending requests for advocate ${advocateIdStr}`);
        
        // Add detailed logging if results found
        if (pendingCases.length > 0) {
            console.log('[getPendingCaseRequests] First pending case details:', {
                id: pendingCases[0]._id.toString(),
                subject: pendingCases[0].subject,
                userID: pendingCases[0].user._id.toString(),
                userName: pendingCases[0].user.name
            });
        }

        return res.status(200).json({
            success: true,
            count: pendingCases.length,
            cases: pendingCases,
        });
    } catch (error) {
        console.error("[getPendingCaseRequests] Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching pending case requests", 
            error: error.message 
        });
    }
};

// Accept a case request
const acceptCaseRequest = async (req, res) => {
    try {
        const { caseId } = req.body;
        const advocateId = req.user.id; // Advocate's ID from token
        const advocateIdStr = advocateId.toString();
        
        console.log(`[acceptCaseRequest] Case ID: ${caseId}, Advocate ID: ${advocateIdStr}`);

        if (!caseId) {
            return res.status(400).json({ 
                success: false,
                message: "Case ID is required." 
            });
        }

        const targetCase = await Case.findById(caseId);

        // Check if case exists
        if (!targetCase) {
            console.log(`[acceptCaseRequest] Case not found with ID: ${caseId}`);
            return res.status(404).json({ 
                success: false,
                message: "Case not found." 
            });
        }

        // Log the pending advocate info for debugging
        const pendingAdvocateId = targetCase.pendingAdvocate?.toString();
        console.log(`[acceptCaseRequest] Case pending advocate: ${pendingAdvocateId}, Request status: ${targetCase.requestStatus}`);
        console.log(`[acceptCaseRequest] Matches logged-in advocate? ${pendingAdvocateId === advocateIdStr}`);

        // Verify if the request is pending for this advocate
        if (pendingAdvocateId !== advocateIdStr) {
            return res.status(403).json({ 
                success: false,
                message: "You are not authorized to accept this case. Request is for a different advocate." 
            });
        }
        
        if (targetCase.requestStatus !== "pending") {
            return res.status(400).json({ 
                success: false,
                message: `This request is not in pending status. Current status: ${targetCase.requestStatus}.` 
            });
        }

        // Update the case: assign advocate, set status, clear pending fields
        targetCase.advocate = advocateId;
        targetCase.status = "assigned";
        targetCase.requestStatus = "accepted";
        targetCase.isFloating = false; // Ensure it's not floating anymore
        
        // We need to keep pendingAdvocate for historical tracking
        // but we'll set the status to "accepted"

        await targetCase.save();
        
        console.log(`[acceptCaseRequest] Case ${caseId} assigned to advocate ${advocateIdStr} successfully`);

        return res.status(200).json({
            success: true,
            message: "Case request accepted successfully. You are now assigned to this case.",
            case: {
                _id: targetCase._id,
                subject: targetCase.subject,
                status: targetCase.status,
            },
        });

    } catch (error) {
        console.error("[acceptCaseRequest] Error:", error);
        return res.status(500).json({ 
            success: false,
            message: "Error accepting case request", 
            error: error.message 
        });
    }
};

// Deny a case request
const denyCaseRequest = async (req, res) => {
    try {
        const { caseId } = req.body;
        const advocateId = req.user.id; // Advocate's ID from token

        if (!caseId) {
            return res.status(400).json({ message: "Case ID is required." });
        }

        const targetCase = await Case.findById(caseId);

        // Check if case exists
        if (!targetCase) {
            return res.status(404).json({ message: "Case not found." });
        }

        // Verify if the request is pending for this advocate
        if (targetCase.pendingAdvocate?.toString() !== advocateId || targetCase.requestStatus !== "pending") {
            return res.status(403).json({ message: "You are not authorized to deny this case or the request is not pending." });
        }

        // Update the case: clear pending fields, set status to denied
        targetCase.pendingAdvocate = null;
        targetCase.requestStatus = "denied";

        await targetCase.save();

        // TODO: Implement notification system for the plaintiff

        res.status(200).json({
            success: true,
            message: "Case request denied successfully.",
        });

    } catch (error) {
        console.error("Error denying case request:", error);
        res.status(500).json({ message: "Error denying case request", error: error.message });
    }
};


module.exports = {
    getPendingCaseRequests,
    acceptCaseRequest,
    denyCaseRequest,
}; 