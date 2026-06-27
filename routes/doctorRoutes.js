const express = require("express");
const router = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  getAdminDoctors,
  updateDoctorStatus,
} = require("../controllers/doctorController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

// 1. Public Routes (Anyone can access)
router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);

// 2. Protected Admin Routes (Requires both middlewares)
router.get("/admin/all", verifyToken, verifyAdmin, getAdminDoctors);
router.patch("/admin/:id/status", verifyToken, verifyAdmin, updateDoctorStatus);

module.exports = router;
