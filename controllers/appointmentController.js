const { ObjectId } = require("mongodb");
const getAppointmentsCollection = require("../collections/appointmentsCollection");
const getUsersCollection = require("../collections/usersCollection");
const getDoctorsCollection = require("../collections/doctorsCollection");

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
      { $set: { status, appointmentStatus: status } },
    );

    if (result.matchedCount > 0) {
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

// Patient: Book a new appointment
const bookAppointment = async (req, res) => {
  try {
    const appointmentData = req.body;
    const patientEmail = req.user.email;

    const usersCollection = await getUsersCollection();
    const patient = await usersCollection.findOne({ email: patientEmail });

    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient user not found." });
    }

    // 1. Fetch Doctor and verify details
    const doctorsCollection = await getDoctorsCollection();
    const doctor = await doctorsCollection.findOne({ _id: new ObjectId(appointmentData.doctorId) });
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found." });
    }

    // 2. Timezone-safe Available Day check
    if (appointmentData.date) {
      const [year, month, day] = appointmentData.date.split("-").map(Number);
      // Construct date as UTC to prevent timezone shift issues
      const bookingDateObj = new Date(Date.UTC(year, month - 1, day));
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const bookingDay = daysOfWeek[bookingDateObj.getUTCDay()];

      if (doctor.availableDays && doctor.availableDays.length > 0 && !doctor.availableDays.includes(bookingDay)) {
        return res
          .status(400)
          .json({ success: false, message: `Doctor is not available on ${bookingDay}s.` });
      }
    }

    // 3. Available Slots check
    if (doctor.availableSlots && doctor.availableSlots.length > 0) {
      if (!doctor.availableSlots.includes(appointmentData.time)) {
        return res
          .status(400)
          .json({ success: false, message: "The selected time slot is not available in the doctor's schedule." });
      }
    }

    // 4. Overlap / Conflict detection (no duplicate active appointments for same date/time)
    const appointmentsCollection = await getAppointmentsCollection();
    const existingAppointment = await appointmentsCollection.findOne({
      doctorId: appointmentData.doctorId,
      date: appointmentData.date,
      time: appointmentData.time,
      status: { $ne: "Cancelled" },
    });

    if (existingAppointment) {
      return res
        .status(400)
        .json({ success: false, message: "This time slot is already booked. Please choose another time." });
    }

    const newAppointment = {
      doctorId: appointmentData.doctorId,
      doctorName: appointmentData.doctorName,
      doctorEmail: appointmentData.doctorEmail,
      specialization: appointmentData.specialization,
      fee: appointmentData.fee,
      date: appointmentData.date,
      time: appointmentData.time,
      patientEmail: patientEmail,
      patientName: patient.name,
      status: "Pending",
      createdAt: new Date(),
    };

    const result = await appointmentsCollection.insertOne(newAppointment);

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully!",
      data: result,
    });
  } catch (error) {
    console.error("Booking Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to book appointment." });
  }
};

// Doctor: Add a prescription and mark appointment as Completed
const addPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { prescription } = req.body;

    const appointmentsCollection = await getAppointmentsCollection();

    const result = await appointmentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { prescription, status: "Completed" } },
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({
        success: true,
        message: "Prescription saved and appointment completed!",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to save prescription. No changes made.",
      });
    }
  } catch (error) {
    console.error("Prescription Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error saving prescription.",
    });
  }
};

// Update Appointment (Status, Reschedule, or Prescription)
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, appointmentDate, appointmentTime, prescription } = req.body;
    const appointmentsCollection = await getAppointmentsCollection();

    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        ...(status && { status }),
        ...(appointmentDate && { date: appointmentDate }),
        ...(appointmentTime && { time: appointmentTime }),
        ...(prescription && { prescription }),
      },
    };

    const result = await appointmentsCollection.updateOne(filter, updateDoc);

    if (result.modifiedCount > 0) {
      res.status(200).json({
        success: true,
        message: "Appointment updated successfully.",
      });
    } else {
      res.status(400).json({ success: false, message: "No changes made." });
    }
  } catch (error) {
    console.error("Update Appointment Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update appointment." });
  }
};

module.exports = {
  getAllAppointmentsAdmin,
  getDoctorAppointments,
  updateAppointmentStatus,
  getPatientAppointments,
  bookAppointment,
  addPrescription,
  updateAppointment,
};
