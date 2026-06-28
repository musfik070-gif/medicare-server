const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  createUser,
  updateUserStatus,
  deleteUser,
  getAdminAnalytics,
} = require("../controllers/usersController");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

router.get("/", verifyToken, verifyAdmin, getAllUsers);
router.get("/admin/analytics", verifyToken, verifyAdmin, getAdminAnalytics);
router.patch("/:id/status", verifyToken, verifyAdmin, updateUserStatus);
router.delete("/:id", verifyToken, verifyAdmin, deleteUser);

router.post("/", createUser);

module.exports = router;
