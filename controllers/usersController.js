const getUsersCollection = require("../collections/usersCollection");

const getAllUsers = async (req, res) => {
  try {
    const usersCollection = await getUsersCollection();

    const users = await usersCollection.find().toArray();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
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

module.exports = {
  getAllUsers,
  createUser,
};
