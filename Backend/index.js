// Backend/index.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./utils/db");
const userRoutes = require("./routes/userRoutes");
const nyayaSanhita = require("./routes/nyayaSanhitaRoutes");
const caseRoutes = require("./routes/caseRoutes");
const legalAssistantRoutes = require("./routes/legalAssistantRoutes"); // Add this line
const cookieParser = require("cookie-parser");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors());

// Static files directory for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/nyaya-sanhita", nyayaSanhita);
app.use("/api/cases", caseRoutes);
app.use("/api/legal-assistant", legalAssistantRoutes); // Add this line

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
    });
});

// Server configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));