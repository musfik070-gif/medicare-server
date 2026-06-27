const express = require("express");
const router = express.Router();
const {
  getAllAppointmentsAdmin,
  getDoctorAppointments,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyDoctor = require("../middleware/verifyDoctor");

// Admin Routes
router.get("/admin/all", verifyToken, verifyAdmin, getAllAppointmentsAdmin);

// Doctor Routes
router.get(
  "/doctor/requests",
  verifyToken,
  verifyDoctor,
  getDoctorAppointments,
);
router.patch(
  "/doctor/:id/status",
  verifyToken,
  verifyDoctor,
  updateAppointmentStatus,
);

module.exports = router;
