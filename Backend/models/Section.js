const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  id: String,
  chapter: String,
  title: String,
  description: String,
});

sectionSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("BNS", sectionSchema);
