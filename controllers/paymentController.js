const getPaymentsCollection = require("../collections/paymentsCollection");

// Admin: Get ALL payments across the platform
const getAllPaymentsAdmin = async (req, res) => {
  try {
    const paymentsCollection = await getPaymentsCollection();

    // Sort by most recent payment first
    const payments = await paymentsCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error("Admin Fetch Payments Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch payment records" });
  }
};

module.exports = { getAllPaymentsAdmin };
