var express = require("express");
var router = express.Router();
const { createUser } = require("../controllers/userController");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "."+ file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/create",upload.single('image'), createUser);

module.exports = router;
