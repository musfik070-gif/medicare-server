const express = require("express");
const router = express.Router();
const {
  getAllPaymentsAdmin,
  createPaymentIntent,
  createCheckoutSession,
  savePayment,
  handleCheckoutSuccess,
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
router.post(
  "/create-checkout-session",
  verifyToken,
  verifyPatient,
  createCheckoutSession,
);
router.get("/checkout-success", handleCheckoutSuccess);
router.post("/", verifyToken, verifyPatient, savePayment);
router.post("/process", verifyToken, verifyPatient, processPayment);
router.get("/patient/history", verifyToken, verifyPatient, getPatientPayments);

module.exports = router;
