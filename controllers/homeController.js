const getDoctorsCollection = require("../collections/doctorsCollection");
const getUsersCollection = require("../collections/usersCollection");
const getAppointmentsCollection = require("../collections/appointmentsCollection");
const getReviewsCollection = require("../collections/reviewsCollection");

const getHomeData = async (req, res) => {
  try {
    const doctorsCollection = await getDoctorsCollection();
    const usersCollection = await getUsersCollection();
    const appointmentsCollection = await getAppointmentsCollection();
    const reviewsCollection = await getReviewsCollection();

    // 1. Fetch Featured Doctors (Only verified ones, limit to 4)
    const featuredDoctors = await doctorsCollection
      .find({ verificationStatus: "Verified" })
      .limit(4)
      .toArray();

    // 2. Fetch Platform Statistics
    const totalDoctors = await doctorsCollection.countDocuments();
    const totalPatients = await usersCollection.countDocuments({
      role: "patient",
    });
    const totalAppointments = await appointmentsCollection.countDocuments();
    const totalReviews = await reviewsCollection.countDocuments();

    // 3. Fetch Success Stories (Reviews with 4 or 5 stars, limit to 3)
    const successStories = await reviewsCollection
      .find({ rating: { $gte: 4 } })
      .limit(3)
      .toArray();

    res.status(200).json({
      success: true,
      data: {
        featuredDoctors,
        stats: { totalDoctors, totalPatients, totalAppointments, totalReviews },
        successStories,
      },
    });
  } catch (error) {
    console.error("Home Data Fetch Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching home data" });
  }
};

module.exports = { getHomeData };
