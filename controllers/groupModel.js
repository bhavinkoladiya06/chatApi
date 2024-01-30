const Group = require("../models/groupSchema");

const createGroup = async (req, res, next) => {
  try {
    const groupData = {
      creator_id: req.body.creator_id,
      name: req.body.name,
      image: req.file.filename,
    };

    // Hash the password

    // Create a new group in the database
    const data = await Group.create(groupData);

    res.status(201).json({
      message: "group created",
      data,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

module.exports = {
  createGroup,
};
