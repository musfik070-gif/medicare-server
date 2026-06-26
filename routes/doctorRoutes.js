const express = require("express");
const router = express.Router();
const { getAllDoctors } = require("../controllers/doctorController");

// Public route to browse doctors
router.get("/", getAllDoctors);

module.exports = router;
