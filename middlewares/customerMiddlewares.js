const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

// Protect routes: Ensures the user is logged in
exports.protectCustomer = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token provided" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the customer by id from the token payload
    req.customer = await Customer.findOne({ where: { customerId: decoded.id } });
    if (!req.customer) {
      return res.status(401).json({ error: "Not authorized, user not found" });
    }

    next();
  } catch (err) {
    res.status(401).json({ error: "Not authorized, token failed" });
  }
};
