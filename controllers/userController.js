const user = require("../models/userModel");
const bcrypt = require("bcrypt");

const createUser = async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const userData = {
      name: req.body.name,
      email: req.body.email,
      image: req.file.filename,
      password: hashedPassword,
    };

    // Hash the password

    // Create a new user in the database
    const data = await user.create(userData);

    res.status(201).json({
      message: "User data created",
      data,
    });
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

module.exports = {
  createUser,
};
