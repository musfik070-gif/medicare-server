const express = require("express");
const router = express.Router();
const { getAllPaymentsAdmin } = require("../controllers/paymentController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

// Protected Admin Route
router.get("/admin/all", verifyToken, verifyAdmin, getAllPaymentsAdmin);

module.exports = router;
