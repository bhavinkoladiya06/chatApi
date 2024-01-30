const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  creator_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
  },
  image: { type: String, required: true },
  member_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "User",default:null }],
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
