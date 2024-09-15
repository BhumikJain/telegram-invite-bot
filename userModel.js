const { string } = require("mathjs");
const mongoose = require("mongoose");

// Mongoose schema for users
const UserSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  username: String,
  name: string,
  referredBy: { type: Number, default: null },
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  lastInteraction: { type: Date, default: Date.now },
});

// Mongoose model for users
const User = mongoose.model("User", UserSchema);

module.exports = User;