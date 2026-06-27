const getUsersCollection = require("../collections/usersCollection");

const verifyPatient = async (req, res, next) => {
  try {
    const email = req.user.email;
    const usersCollection = await getUsersCollection();

    const user = await usersCollection.findOne({ email });

    if (!user || user.role !== "patient") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden Access. Patients only." });
    }

    next();
  } catch (error) {
    console.error("Patient Verification Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error verifying patient status.",
      });
  }
};

module.exports = verifyPatient;
