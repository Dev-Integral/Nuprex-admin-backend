const express = require("express");
const passport = require("passport");
const generateToken = require("../utils/generateToken");
const router = express.Router();

// Google OAuth login route
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google OAuth callback route
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    // If authentication was successful, req.user will contain the user object
    if (!req.user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Create a JWT token
    const token = generateToken(req.user.id);

    // Send the token to the client
    res.json({
      message: "Authentication successful",
      token: token,
      user: {
        email: req.user.email,
        customerId: req.user.customerId,
        name: req.user.name,
        imageUrl: req.user.imageUrl,
      },
    });
  }
);

module.exports = router;
