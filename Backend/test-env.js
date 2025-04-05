// test-env.js
require('dotenv').config();
console.log("All env variables:", process.env);
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY);