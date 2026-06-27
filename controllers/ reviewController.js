const getReviewsCollection = require("../collections/reviewsCollection");

// Patient: Add a review for a doctor
const addReview = async (req, res) => {
  try {
    const { doctorId, doctorName, rating, comment, patientName } = req.body;
    const patientEmail = req.user.email; // Securely from JWT

    const newReview = {
      doctorId,
      doctorName,
      patientEmail,
      patientName,
      rating: Number(rating),
      comment,
      createdAt: new Date(),
    };

    const reviewsCollection = await getReviewsCollection();
    await reviewsCollection.insertOne(newReview);

    res
      .status(201)
      .json({ success: true, message: "Review submitted successfully!" });
  } catch (error) {
    console.error("Review Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to submit review." });
  }
};

// Public: Get reviews for a specific doctor (to show on their public profile later)
const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const reviewsCollection = await getReviewsCollection();

    const reviews = await reviewsCollection
      .find({ doctorId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error("Fetch Reviews Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch reviews." });
  }
};

module.exports = { addReview, getDoctorReviews };
