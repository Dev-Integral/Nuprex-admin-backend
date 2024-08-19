const Admin = require("../models/Admin");
const Customer = require("../models/Customer");
const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  const { currentLocation, destination, riderId, amount, type } = req.body;
  const {customerId} = req.customer;
  try {
    // Check if the customer exists using the userId
    const customer = await Customer.findOne({ where: { customerId } });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    const order = await Order.create({
      currentLocation,
      destination,
      customerId,
      riderId,
      amount,
      type,
    });
    res.status(201).json({
      message: "Order created Successfully",
      order
    });
  } catch (error) {
    return res.status(500).json({ error: error["message"] });
  }
};
exports.getAllOrders = async (req, res) => {
    const {adminId} = req.admin;
    try {
      // Check if the customer exists using the userId
      const admin = await Admin.findOne({ where: { adminId } });
      if (!admin) {
        return res.status(404).json({ message: "User not found" });
      }
      const orders = await Order.findAll();
      res.status(200).json({
        message: "Orders fetched Successfully",
        orders
      });
    } catch (error) {
      return res.status(500).json({ error: error["message"] });
    }
  };