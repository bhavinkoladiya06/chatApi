const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  is_online: {
    type: String,
    required: true,
    default: "0",
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
