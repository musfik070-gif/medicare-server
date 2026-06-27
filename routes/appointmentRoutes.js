const express = require("express");
const router = express.Router();
const {
  getAllAppointmentsAdmin,
} = require("../controllers/appointmentController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

// Protected Admin Route
router.get("/admin/all", verifyToken, verifyAdmin, getAllAppointmentsAdmin);

module.exports = router;
