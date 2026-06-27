const getReviewsCollection = require("../collections/reviewsCollection");

const addReview = async (req, res) => {
  try {
    const reviewData = req.body;
    const patientEmail = req.user?.email;

    const reviewsCollection = await getReviewsCollection();

    const newReview = {
      ...reviewData,
      patientEmail,
      createdAt: new Date(),
    };

    const result = await reviewsCollection.insertOne(newReview);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Add Review Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to submit review" });
  }
};

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
    console.error("Get Doctor Reviews Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch reviews" });
  }
};

module.exports = { addReview, getDoctorReviews };
