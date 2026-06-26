const getDoctorsCollection = require("../collections/doctorsCollection");

const getAllDoctors = async (req, res) => {
  try {
    const doctorsCollection = await getDoctorsCollection();

    // 1. Grab query parameters sent by the frontend (e.g., ?search=john&sort=feeAsc)
    const { search, sort, page = 1, limit = 6 } = req.query;

    // 2. Build the Search Query
    // We ONLY want to show doctors who are officially "Verified" by the Admin
    let query = { verificationStatus: "Verified" };

    if (search) {
      // $or allows us to search by EITHER name OR specialization
      // $regex and $options: "i" make the search case-insensitive
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

module.exports = { getAllDoctors };
