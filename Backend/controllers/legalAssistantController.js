// Backend/controllers/legalAssistantController.js
const fetch = require('node-fetch');

// No API key needed for some public models on Hugging Face
console.log("Using Hugging Face open source model");

exports.processChat = async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid messages format'
            });
        }

        // Get the latest user message
        const userQuestion = messages[messages.length - 1].content;
        console.log("Processing question:", userQuestion);

        // Format the prompt with context
        const prompt = `
You are a helpful legal assistant for NyayaSarthi, focusing on Indian law. 
You provide information about the Bharatiya Nyaya Sanhita (BNS), 
Bharatiya Nagarik Suraksha Sanhita (BNSS), and other Indian legal codes.
Provide accurate, concise answers based on current Indian law. 
If you're unsure, acknowledge limitations and suggest consulting a legal professional.

User question: ${userQuestion}

Your helpful response:`;

        // Call the Hugging Face API with a free, open-source model
        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inputs: prompt }),
                timeout: 25000 // 25 second timeout
            }
        );

        if (!response.ok) {
            throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const assistantResponse = data.generated_text || "I'm sorry, I couldn't generate a response. Please try again.";

        console.log("Generated response successfully");

        // Send response back to client
        return res.status(200).json({
            success: true,
            response: assistantResponse
        });

    } catch (error) {
        console.error('Model API Error:', error);

        // Fall back to simple responses if there's an error
        return exports.processSimpleChat(req, res);
    }
};

// Simple fallback endpoint
exports.processSimpleChat = (req, res) => {
    try {
        // Extract query from request
        const query = req.body.messages
            ? req.body.messages[req.body.messages.length - 1].content
            : req.body.query;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid query format'
            });
        }

        console.log("Using fallback for query:", query);

        // Enhanced keyword-based responses for legal queries
        let response;
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('murder') || lowerQuery.includes('kill')) {
            response = 'Under the Bharatiya Nyaya Sanhita, murder is covered under Section 103 with punishment that may include imprisonment for life or death penalty.';
        } else if (lowerQuery.includes('theft') || lowerQuery.includes('steal')) {
            response = 'Theft is defined in Section 303 of the Bharatiya Nyaya Sanhita with punishment of imprisonment up to 3 years, or fine, or both.';
        } else if (lowerQuery.includes('bail')) {
            response = 'Bail provisions are covered under the Bharatiya Nagarik Suraksha Sanhita (BNSS). Generally, bail is a right in bailable offenses and discretionary in non-bailable offenses.';
        } else if (lowerQuery.includes('divorce')) {
            response = 'Divorce in India is governed by personal laws based on religion and the Special Marriage Act. Grounds may include cruelty, desertion, conversion, mental illness, among others.';
        } else if (lowerQuery.includes('property') || lowerQuery.includes('inheritance')) {
            response = 'Property rights in India are governed by personal laws and the Indian Succession Act. Laws vary based on religion and whether the property is ancestral or self-acquired.';
        } else if (lowerQuery.includes('domestic') || lowerQuery.includes('violence')) {
            response = 'Domestic violence is addressed under the Protection of Women from Domestic Violence Act, 2005. It provides civil remedies including protection orders, residence orders, monetary relief, and custody orders.';
        } else if (lowerQuery.includes('rape') || lowerQuery.includes('sexual assault')) {
            response = 'Sexual assault and rape are covered under Sections 64-69 of the Bharatiya Nyaya Sanhita, with stringent punishments ranging from 10 years to life imprisonment depending on the circumstances.';
        } else if (lowerQuery.includes('fraud') || lowerQuery.includes('cheating')) {
            response = 'Fraud and cheating are covered under Section 316 of the Bharatiya Nyaya Sanhita, punishable with imprisonment up to 7 years and fine.';
        } else if (lowerQuery.includes('defamation')) {
            response = 'Defamation is covered under Section 356 of the Bharatiya Nyaya Sanhita. It can be punishable with imprisonment up to 2 years, or fine, or both.';
        } else if (lowerQuery.includes('right to information') || lowerQuery.includes('rti')) {
            response = 'The Right to Information Act, 2005 empowers citizens to request information from public authorities. Applications must be responded to within 30 days, with exemptions for national security, privacy, and other specified grounds.';
        } else if (lowerQuery.includes('cybercrime') || lowerQuery.includes('cyber crime') || lowerQuery.includes('hacking')) {
            response = 'Cybercrimes are primarily dealt with under the Information Technology Act, 2000 (amended in 2008). Offenses include unauthorized access, data theft, identity theft, publishing obscene material, and cyber terrorism.';
        } else if (lowerQuery.includes('nyaya sanhita') || lowerQuery.includes('criminal code')) {
            response = 'The Bharatiya Nyaya Sanhita (BNS) replaced the Indian Penal Code in 2023. It modernizes criminal laws and includes new provisions for contemporary crimes while simplifying legal procedures.';
        } else if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
            response = 'Hello! I\'m your legal assistant. How can I help you with Indian law today?';
        } else if (lowerQuery.includes('thank')) {
            response = 'You\'re welcome! Feel free to ask if you have any other legal questions.';
        } else {
            response = 'I understand you\'re asking about a legal matter. The Bharatiya Nyaya Sanhita covers various aspects of criminal law in India. For specific advice on your situation, I recommend consulting a qualified legal professional or referring to the specific sections of the code for accurate information.';
        }

        // Send response back to client
        return res.status(200).json({
            success: true,
            response: response
        });

    } catch (error) {
        console.error('Simple Chat API Error:', error);

        // Return error to client
        return res.status(500).json({
            success: false,
            message: 'Failed to process your request',
            error: error.message
        });
    }
};

// Service status check
exports.checkStatus = async (req, res) => {
    try {
        // Try a simple API call to check if the service is available
        console.log("Checking model status...");
        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inputs: "Hello" }),
                timeout: 5000 // 5 second timeout for quick check
            }
        );

        if (response.ok) {
            console.log("Model status check successful");
            return res.status(200).json({
                available: true,
                version: '1.0.0'
            });
        } else {
            throw new Error(`Status check failed: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('Model Status Check Error:', error);

        // Always return available:true for the frontend
        return res.status(200).json({
            available: true,
            mode: 'fallback',
            message: 'Using fallback mode'
        });
    }
};