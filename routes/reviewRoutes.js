const express = require("express");
const router = express.Router();
const {
  addReview,
  getDoctorReviews,
  getAllReviews,
  getMyReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const verifyToken = require("../middleware/verifyToken");
const verifyPatient = require("../middleware/verifyPatient");

// Public: Fetch all reviews for homepage
router.get("/all", getAllReviews);

// Public: Anyone can see a doctor's reviews
router.get("/doctor/:doctorId", getDoctorReviews);

// Protected: Only patients can leave a review
router.post("/", verifyToken, verifyPatient, addReview);
router.get("/patient/my-reviews", verifyToken, verifyPatient, getMyReviews);
router.patch("/:id", verifyToken, verifyPatient, updateReview);
router.delete("/:id", verifyToken, verifyPatient, deleteReview);

module.exports = router;
