const getDoctorsCollection = require("../collections/doctorsCollection");
const getUsersCollection = require("../collections/usersCollection");
const { ObjectId } = require("mongodb");

const getAllDoctors = async (req, res) => {
  try {
    const doctorsCollection = await getDoctorsCollection();

    const { search, sort, page = 1, limit = 6 } = req.query;

    let query = { verificationStatus: "Verified" };

    if (search) {
      query.$or = [
        { doctorName: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
      ];
    }

    // 3. Build the Sort Options
    let sortOptions = {};
    if (sort === "feeAsc") sortOptions.consultationFee = 1; // Lowest fee first
    if (sort === "feeDesc") sortOptions.consultationFee = -1; // Highest fee first
    if (sort === "experienceDesc") sortOptions.experience = -1; // Highest experience first

    // 4. Pagination Math (Prepping for Step 8)
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 5. Fetch the Data from MongoDB
    const doctors = await doctorsCollection
      .find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // 6. Get the total count for the frontend pagination buttons
    const totalDoctors = await doctorsCollection.countDocuments(query);

    res.status(200).json({
      success: true,
      data: doctors,
      total: totalDoctors,
      totalPages: Math.ceil(totalDoctors / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Fetch Doctors Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching doctors" });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorsCollection = await getDoctorsCollection();

    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid doctor ID" });
    }

    const doctor = await doctorsCollection.findOne({ _id: new ObjectId(id) });

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    console.error("Fetch Doctor By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching doctor details",
    });
  }
};

// Admin: Get ALL doctors (Pending, Verified, Rejected)
const getAdminDoctors = async (req, res) => {
  try {
    const doctorsCollection = await getDoctorsCollection();
    const doctors = await doctorsCollection.find().toArray();
    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    console.error("Admin Fetch Doctors Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch doctors" });
  }
};

// Admin: Update doctor verification status
const updateDoctorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expects "Verified" or "Rejected"

    const doctorsCollection = await getDoctorsCollection();
    const application = await doctorsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }

    const doctorUpdate = await doctorsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { verificationStatus: status } },
    );

    if (status !== "Verified") {
      if (doctorUpdate.modifiedCount > 0) {
        return res.status(200).json({
          success: true,
          message: `Doctor status updated to ${status}`,
        });
      }

      return res
        .status(400)
        .json({ success: false, message: "Failed to update status" });
    }

    const usersCollection = await getUsersCollection();
    const userUpdate = await usersCollection.updateOne(
      { email: application.email },
      { $set: { role: "doctor" } },
    );

    if (userUpdate.modifiedCount > 0) {
      return res.status(200).json({
        success: true,
        message: "Doctor verified and user role updated to 'doctor'!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Doctor verified (User role was already doctor).",
    });
  } catch (error) {
    console.error("Approve Doctor Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to approve doctor." });
  }
};

// Doctor: Get own professional profile
const getDoctorProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const doctorsCollection = await getDoctorsCollection();

    const profile = await doctorsCollection.findOne({ email });

    res.status(200).json({ success: true, data: profile || {} });
  } catch (error) {
    console.error("Fetch Doctor Profile Error:", error);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};

// Doctor: Create or Update own professional profile
const updateDoctorProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const updateData = req.body;
    const doctorsCollection = await getDoctorsCollection();

    await doctorsCollection.updateOne(
      { email },
      {
        $set: {
          ...updateData,
          email,
        },
        $setOnInsert: { verificationStatus: "Pending", createdAt: new Date() },
      },
      { upsert: true },
    );

    res
      .status(200)
      .json({ success: true, message: "Profile saved successfully" });
  } catch (error) {
    console.error("Update Doctor Profile Error:", error);
    res.status(500).json({ success: false, message: "Error saving profile" });
  }
};

const updateDoctorSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { availableSlots } = req.body;
    const doctorsCollection = await getDoctorsCollection();

    const result = await doctorsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { availableSlots } },
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ success: true, message: "Schedule updated." });
    } else {
      res.status(400).json({ success: false, message: "No changes made." });
    }
  } catch (error) {
    console.error("Update Doctor Schedule Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update schedule." });
  }
};

const applyDoctor = async (req, res) => {
  try {
    const { name, email, specialization, experience, fee, photoURL } = req.body;
    const doctorsCollection = await getDoctorsCollection();

    const existingApp = await doctorsCollection.findOne({ email });
    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: "You have already applied. Please wait for admin approval.",
      });
    }

    const newDoctor = {
      name,
      email,
      specialization,
      experience,
      fee: Number(fee),
      photoURL,
      verificationStatus: "Pending",
      availableSlots: [],
      createdAt: new Date(),
    };

    const result = await doctorsCollection.insertOne(newDoctor);

    res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      data: result,
    });
  } catch (error) {
    console.error("Apply Doctor Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to submit application." });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getAdminDoctors,
  updateDoctorStatus,
  getDoctorProfile,
  updateDoctorProfile,
  updateDoctorSchedule,
  applyDoctor,
};
