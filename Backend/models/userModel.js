const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["plaintiff", "advocate"],
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false, // Only true after admin approval for advocates
    },
    barCouncilRegNo: {
      type: String,
      required: function () {
        return this.role === "advocate"; // Required only for advocates
      },
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
