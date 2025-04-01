// Backend/index.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./utils/db");
const userRoutes = require("./routes/userRoutes");
const nyayaSanhita = require("./routes/nyayaSanhitaRoutes");
const caseRoutes = require("./routes/caseRoutes");
const advocateRoutes = require("./routes/advocateRoutes");  // Import the advocate routes
const cookieParser = require("cookie-parser");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Restore specific CORS Configuration
const corsOptions = {
  origin: "http://localhost:3000", // Your frontend URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Explicitly list methods
  credentials: true, // Allow cookies/authorization headers
  allowedHeaders: ["Content-Type", "Authorization"], // Include necessary headers
  optionsSuccessStatus: 200 // Return 200 for preflight requests
};

// Initialize Express app
const app = express();

// Middleware
app.use(cors(corsOptions)); // Apply specific CORS configuration
app.options('*', cors(corsOptions)); // Enable pre-flight requests with options

app.use(cookieParser());
app.use(express.json());

// Static files directory for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/nyaya-sanhita", nyayaSanhita);
app.use("/api/cases", caseRoutes);
app.use("/api/advocate", advocateRoutes);  // Use advocate routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

// Server configuration
const PORT = process.env.PORT || 3005 || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
