const express = require("express");
const router = express.Router();
const { getHomeData } = require("../controllers/homeController");

// This route is completely public, no JWT required
router.get("/", getHomeData);

module.exports = router;
