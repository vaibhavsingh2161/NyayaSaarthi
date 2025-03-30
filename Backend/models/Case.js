// Backend/models/Case.js
const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileData: {
    type: Buffer,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

const caseSchema = mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    caseType: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    advocate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    documents: [documentSchema],
    status: {
      type: String,
      enum: ["pending", "assigned", "in-progress", "closed"],
      default: "pending",
    },
    isFloating: {
      type: Boolean,
      default: false,
    },
    bids: [
      {
        advocate: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        amount: Number,
        message: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Case", caseSchema);