const express = require("express");
const router = express.Router();
const {
  getAllDoctors,
  getDoctorById,
} = require("../controllers/doctorController");

// Public route to browse doctors
router.get("/", getAllDoctors);

// Public route to get a single doctor by their ID
router.get("/:id", getDoctorById);

module.exports = router;
