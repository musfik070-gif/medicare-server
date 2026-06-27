const getUsersCollection = require("../collections/usersCollection");

const verifyDoctor = async (req, res, next) => {
  try {
    const email = req.user.email;
    const usersCollection = await getUsersCollection();

    const user = await usersCollection.findOne({ email });

    if (!user || user.role !== "doctor") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden Access. Doctors only." });
    }

    next();
  } catch (error) {
    console.error("Doctor Verification Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error verifying doctor status.",
      });
  }
};

module.exports = verifyDoctor;
