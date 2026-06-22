const getUsersCollection = require("../collections/usersCollection");

const healthCheck = async (req, res) => {
  try {
    const usersCollection = await getUsersCollection();

    const count = await usersCollection.countDocuments();

    res.status(200).json({
      success: true,
      message: "Server and database working",
      totalUsers: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { healthCheck };
