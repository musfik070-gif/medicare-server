const getAppointmentsCollection = require("../collections/appointmentsCollection");

// Admin: Get ALL appointments across the platform
const getAllAppointmentsAdmin = async (req, res) => {
  try {
    const appointmentsCollection = await getAppointmentsCollection();

    // Sort by most recent first
    const appointments = await appointmentsCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error("Admin Fetch Appointments Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch appointments" });
  }
};

module.exports = { getAllAppointmentsAdmin };
