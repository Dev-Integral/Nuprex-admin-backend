const Admin = require("../models/Admin");
const Rider = require("../models/Rider");
const codeGenerator = require("../utils/codeGenerator");
const { v4: uuidv4 } = require("uuid");

exports.createRider = async (req, res) => {
  const {
    firstname,
    lastname,
    gender,
    phone,
    email,
    homeAddress,
    riderCode,
    vehicleType,
  } = req.body;
  const { adminId } = req.admin;
  try {
    const admin = await Admin.findOne({ where: { adminId } });
    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }
    const orderId = uuidv4();
    const order = await Rider.create({
      homeAddress,
      firstname,
      lastname,
      gender,
      phone,
      email,
      orderId,
      creator: adminId,
      vehicleType,
      riderCode,
    });
    res.status(201).json({
      message: "Order created Successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({ error: error["message"] });
  }
};

exports.getRiderCode = async (req, res) => {
  const { adminId } = req.admin;
  try {
    const admin = await Admin.findOne({ where: { adminId } });
    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }
    const riderCode = codeGenerator(7, "numeric");
    const codeExist = await Rider.findOne({ where: { riderCode } });
    if (codeExist) {
      return res
        .status(400)
        .json({ message: "Rider code already exist, try again" });
    }
    return res.status(201).json({ message: "Rider code generated", riderCode });
  } catch (error) {
    return res.status(500).json({ error: error["message"] });
  }
};

exports.getRiders = async (req, res) => {
  const { adminId } = req.admin;
  const { page = 1, limit = 10, name, paginate = "false" } = req.query;

  const admin = await Admin.findOne({ where: { adminId } });

  if (!admin) {
    return res.status(404).json({ message: "User not found" });
  }
  // Build the query filter
  const filter = {};

  if (name) {
    filter.type = name;
  }

  let riders;
  if (paginate === "true") {
    // Apply pagination
    const offset = (page - 1) * limit;

    riders = await Rider.findAndCountAll({
      where: filter,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Riders fetched successfully",
      currentPage: parseInt(page),
      totalPages: Math.ceil(riders.count / limit),
      totalRiders: riders.count,
      riders: riders.rows,
    });
  } else {
    // No pagination
    riders = await Rider.findAll({
      where: filter,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Riders fetched successfully",
      totalRiders: riders.length,
      riders,
    });
  }
};
