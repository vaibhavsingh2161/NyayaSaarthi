const express = require("express");
const Section = require("../models/Section");
const Chapter = require("../models/Chapter");

const cors = require('cors');
const app = express();
app.use(cors());

app.get("/search", async (req, res) => {
  const query = req.query.q; 
  try {
    const results = await Section.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } } 
    ).sort({ score: { $meta: "textScore" } }); 
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/sections", async (req, res) => {
  const chapter = req.query.chapter; // Get the chapter from query params
  try {
    const sections = await Section.find({ chapter }); // Fetch sections for the chapter
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/chapter-title", async (req, res) => {
  const chapter = req.query.chapter; // Get the chapter from query params
  try {
    // Fetch the chapter by its identifier
    const chapterDoc = await Chapter.findOne({ chapter }); // Find chapter by chapter identifier
    if (!chapterDoc) {
      return res.status(404).json({ error: "Chapter not found" });
    }
    res.json({ title: chapterDoc.chapter_name }); // Return the chapter name (title)
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = app;