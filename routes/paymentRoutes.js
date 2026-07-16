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
  handleStripeWebhook,
} = require("../controllers/paymentController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyPatient = require("../middleware/verifyPatient");

// Stripe Webhook (must use raw body parser, no auth — Stripe signs the request)
router.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

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
