const getUsersCollection = require("../collections/usersCollection");
const { ObjectId } = require("mongodb");

const verifyAdmin = async (req, res, next) => {
  try {
    // req.user comes from the verifyToken middleware that runs right before this!
    const email = req.user.email;
    const usersCollection = await getUsersCollection();

    const user = await usersCollection.findOne({ email });

    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden Access. Admin only." });
    }

    next(); // If they are an admin, let them proceed
  } catch (error) {
    console.error("Admin Verification Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error verifying admin status.",
      });
  }
};

module.exports = verifyAdmin;
