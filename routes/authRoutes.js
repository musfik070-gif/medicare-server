const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  googleLogin,
} = require("../controllers/authController");

const { toNodeHandler } = require("better-auth/node");
const { auth } = require("../auth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);

// Better Auth wildcard handler (using named parameter for Express 5 compatibility)
router.all("/*splat", toNodeHandler(auth.handler));

module.exports = router;
