const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
  chapter: {
    type: String,
    required: true,
  },
  chapter_name: {
    type: String,
    required: true,
  },
});

chapterSchema.index({ chapter_name: "text" });

module.exports = mongoose.model("BNS-Chapter", chapterSchema);
