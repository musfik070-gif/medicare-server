const express = require("express");
const router = express.Router();
const {
  getAllPaymentsAdmin,
  createPaymentIntent,
  processPayment,
  getPatientPayments,
} = require("../controllers/paymentController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyPatient = require("../middleware/verifyPatient");

// Admin Routes
router.get("/admin/all", verifyToken, verifyAdmin, getAllPaymentsAdmin);

// Patient Routes
router.post(
  "/create-payment-intent",
  verifyToken,
  verifyPatient,
  createPaymentIntent,
);
router.post("/process", verifyToken, verifyPatient, processPayment);
router.get("/patient/history", verifyToken, verifyPatient, getPatientPayments);

module.exports = router;
