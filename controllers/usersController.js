const getUsersCollection = require("../collections/usersCollection");
const getAppointmentsCollection = require("../collections/appointmentsCollection");
const getReviewsCollection = require("../collections/reviewsCollection");
const getDoctorsCollection = require("../collections/doctorsCollection");
const { ObjectId } = require("mongodb");

const getAllUsers = async (req, res) => {
  try {
    const usersCollection = await getUsersCollection();

    const users = await usersCollection.find().toArray();

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

const createUser = async (req, res) => {
  try {
    const usersCollection = await getUsersCollection();

    const user = req.body;

    const result = await usersCollection.insertOne({
      ...user,
      role: user.role || "patient",
      status: "active",
      createdAt: new Date(),
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } },
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({
        success: true,
        message: `User status updated to ${status}`,
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Failed to update status" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const usersCollection = await getUsersCollection();

    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount > 0) {
      res
        .status(200)
        .json({ success: true, message: "User deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error deleting user" });
  }
};

const getAdminAnalytics = async (req, res) => {
  try {
    const usersCollection = await getUsersCollection();
    const appointmentsCollection = await getAppointmentsCollection();
    const reviewsCollection = await getReviewsCollection();
    const doctorsCollection = await getDoctorsCollection();

    const totalPatients = await usersCollection.countDocuments({
      role: "patient",
    });
    const totalDoctors = await usersCollection.countDocuments({
      role: "doctor",
    });
    const totalAppointments = await appointmentsCollection.countDocuments();

    const reviews = await reviewsCollection.find({}).toArray();
    const doctors = await doctorsCollection
      .find({ verificationStatus: "Verified" })
      .toArray();

    const doctorPerformance = doctors.map((doctor) => {
      const doctorReviews = reviews.filter(
        (review) =>
          review.doctorId === doctor._id.toString() ||
          review.doctorEmail === doctor.email,
      );

      const avgRating =
        doctorReviews.length > 0
          ? doctorReviews.reduce(
              (sum, review) => sum + Number(review.rating || 0),
              0,
            ) / doctorReviews.length
          : 0;

      return {
        name: `Dr. ${doctor.name || doctor.doctorName}`,
        rating: Number(avgRating.toFixed(1)),
        reviewsCount: doctorReviews.length,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        doctorPerformance,
      },
    });
  } catch (error) {
    console.error("Admin Analytics Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch analytics." });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUserStatus,
  deleteUser,
  getAdminAnalytics,
};
