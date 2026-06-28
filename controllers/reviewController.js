const { ObjectId } = require("mongodb");
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

const getAllReviews = async (req, res) => {
  try {
    const reviewsCollection = await getReviewsCollection();

    const reviews = await reviewsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(4)
      .toArray();

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error("Fetch All Reviews Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch platform reviews.",
    });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const email = req.user?.email || req.decoded?.email;
    const reviewsCollection = await getReviewsCollection();

    const reviews = await reviewsCollection
      .find({ patientEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error("Get My Reviews Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch reviews." });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, reviewText } = req.body;
    const reviewsCollection = await getReviewsCollection();

    const result = await reviewsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { rating, reviewText, updatedAt: new Date() } }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ success: true, message: "Review updated." });
    } else {
      res.status(400).json({ success: false, message: "No changes made." });
    }
  } catch (error) {
    console.error("Update Review Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update review." });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const reviewsCollection = await getReviewsCollection();

    const result = await reviewsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount > 0) {
      res.status(200).json({ success: true, message: "Review deleted." });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Failed to delete review." });
    }
  } catch (error) {
    console.error("Delete Review Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete review." });
  }
};

module.exports = {
  addReview,
  getDoctorReviews,
  getAllReviews,
  getMyReviews,
  updateReview,
  deleteReview,
};
