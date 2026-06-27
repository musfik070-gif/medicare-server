const express = require("express");
const router = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  getAdminDoctors,
  updateDoctorStatus,
  getDoctorProfile,
  updateDoctorProfile,
} = require("../controllers/doctorController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyDoctor = require("../middleware/verifyDoctor");

// --- PROTECTED DOCTOR ROUTES ---
router.get("/profile/me", verifyToken, verifyDoctor, getDoctorProfile);
router.patch("/profile/me", verifyToken, verifyDoctor, updateDoctorProfile);

// --- PROTECTED ADMIN ROUTES ---
router.get("/admin/all", verifyToken, verifyAdmin, getAdminDoctors);
router.patch("/admin/:id/status", verifyToken, verifyAdmin, updateDoctorStatus);

// --- PUBLIC ROUTES ---
router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);

module.exports = router;
