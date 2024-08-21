const Admin = require("../models/Admin");
const Order = require("../models/Order");
const Rider = require("../models/Rider");
const codeGenerator = require("../utils/codeGenerator");
const { v4: uuidv4 } = require("uuid");

exports.getRiderCode = async (req, res) => {
  const { adminId } = req.admin;
  try {
    const admin = await Admin.findOne({ where: { adminId } });
    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }
    const riderCode = "RD-" + codeGenerator(7, "numeric");
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
    const riderId = uuidv4();
    const rider = await Rider.create({
      homeAddress,
      firstname,
      lastname,
      gender,
      phone,
      email,
      riderId,
      creator: adminId,
      vehicleType,
      riderCode,
    });
    res.status(201).json({
      message: "Rider created Successfully",
      rider,
    });
  } catch (error) {
    return res.status(500).json({ error: error["message"], error });
  }
};
exports.getRiders = async (req, res) => {
  const { adminId } = req.admin;
  const { page = 1, limit = 10, name, paginate = "false" } = req.query;
  try {
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
  } catch (error) {
    return res.status(500).json({ error: error["message"], error });
  }
};
exports.getRiderbyId = async (req, res) => {
  const { adminId } = req.admin;
  const { riderId } = req.params;
  try {
    const admin = await Admin.findOne({ where: { adminId } });

    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }
    const rider = await Rider.findOne({ where: { riderId } });
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }
    return res.status(200).json({
      rider,
    });
  } catch (error) {
    return res.status(500).json({ error: error["message"], error });
  }
};
exports.suspendRider = async (req, res) => {
  const { adminId } = req.admin;
  const { riderId } = req.params;
  const { reason } = req.body;
  try {
    const admin = await Admin.findOne({ where: { adminId } });

    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }
    const rider = await Rider.findOne({ where: { riderId } });
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }
    rider.isSuspended = true;
    rider.reason = reason;
    await rider.save();
    return res.status(200).json({
      message: "Rider suspended successfully",
      rider,
    });
  } catch (error) {
    return res.status(500).json({ error: error["message"], error });
  }
};
exports.activateRider = async (req, res) => {
  const { adminId } = req.admin;
  const { riderId } = req.params;
  try {
    const admin = await Admin.findOne({ where: { adminId } });

    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }
    const rider = await Rider.findOne({ where: { riderId } });
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }
    rider.isSuspended = false;
    rider.reason = "";
    await rider.save();
    return res.status(200).json({
      message: "Rider activated successfully",
      rider,
    });
  } catch (error) {
    return res.status(500).json({ error: error["message"], error });
  }
};
exports.riderActivities = async (req, res) => {
  const { adminId } = req.admin;
  const { riderId } = req.params;
  const { orderId } = req.query;
  try {
    const admin = await Admin.findOne({ where: { adminId } });
    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }
    let riderActivities;

    const filter = {};
    if (orderId) {
        filter["orderId"] = orderId;
    }
    filter.riderId = riderId;
    if (paginate === "true") {
      // Apply pagination
      const offset = (page - 1) * limit;

      riderActivities = await Order.findAndCountAll({
        where: filter,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]],
      });
      if (!riderActivities) {
        return res.status(404).json({ message: "No activities found" });
      }
      return res.status(200).json({
        message: "Rider activities fetched successfully",
        currentPage: parseInt(page),
        totalPages: Math.ceil(riderActivities.count / limit),
        totalActivities: riderActivities.count,
        riders: riderActivities.rows,
      });
    } else {
      // No pagination
      riderActivities = await Order.findAll({
        where: filter,
        order: [["createdAt", "DESC"]],
      });
      if (!riderActivities) {
        return res.status(404).json({ message: "No activities found" });
      }
      return res.status(200).json({
        message: "Rider activities fetched successfully",
        riderActivities,
        totalRiderActivities: riderActivities.length,
        riderActivities,
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error["message"], error });
  }
};
