const getDoctorsCollection = require("../collections/doctorsCollection");
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
    res
      .status(500)
      .json({
        success: false,
        message: "Server error fetching doctor details",
      });
  }
};

module.exports = { getAllDoctors, getDoctorById };
