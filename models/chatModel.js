const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  message: { type: String, required: true },
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
