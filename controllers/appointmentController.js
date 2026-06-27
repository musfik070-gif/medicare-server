const { ObjectId } = require("mongodb");
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

// Doctor: Get their specific appointment requests
const getDoctorAppointments = async (req, res) => {
  try {
    const doctorEmail = req.user.email;
    const appointmentsCollection = await getAppointmentsCollection();

    const appointments = await appointmentsCollection
      .find({ doctorEmail })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error("Doctor Fetch Appointments Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointment requests",
    });
  }
};

// Doctor: Update appointment status (Approve, Complete, etc.)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointmentsCollection = await getAppointmentsCollection();
    const result = await appointmentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } },
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({
        success: true,
        message: `Appointment status updated to ${status}`,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to update status or no changes made.",
      });
    }
  } catch (error) {
    console.error("Update Appointment Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating appointment",
    });
  }
};

// Patient: Get their own booked appointments
const getPatientAppointments = async (req, res) => {
  try {
    const patientEmail = req.user.email;
    const appointmentsCollection = await getAppointmentsCollection();

    const appointments = await appointmentsCollection
      .find({ patientEmail })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error("Patient Fetch Appointments Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your appointments",
    });
  }
};

module.exports = {
  getAllAppointmentsAdmin,
  getDoctorAppointments,
  updateAppointmentStatus,
  getPatientAppointments,
};
