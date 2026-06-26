const getUsersCollection = require("../collections/usersCollection");
const { ObjectId } = require("mongodb");

const getAllUsers = async (req, res) => {
  try {
    const usersCollection = await getUsersCollection();

    const users = await usersCollection.find().toArray();

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

const createUser = async (req, res) => {
  try {
    const usersCollection = await getUsersCollection();

    const user = req.body;

    const result = await usersCollection.insertOne({
      ...user,
      role: user.role || "patient",
      status: "active",
      createdAt: new Date(),
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } },
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({
        success: true,
        message: `User status updated to ${status}`,
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Failed to update status" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const usersCollection = await getUsersCollection();

    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount > 0) {
      res
        .status(200)
        .json({ success: true, message: "User deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error deleting user" });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUserStatus,
  deleteUser,
};
