const Customer = require("../models/Customer");
const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  const { currentLocation, destination, riderId, amount, type } = req.body;
  const customerId = req.customerId;
  try {
    // Check if the admin exists using the userId
    // const customer = await Customer.findOne({ where: { customerId } });
    // if (!customer) {
    //   return res.status(404).json({ message: "Customer not found" });
    // }
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
  } catch (error) {}
};
exports.getAllOrders = async (req, res) => {
    const customerId = req.customerId;
    try {
      // Check if the admin exists using the userId
      // const customer = await Customer.findOne({ where: { customerId } });
      // if (!customer) {
      //   return res.status(404).json({ message: "Customer not found" });
      // }
      const orders = await Order.findAll({
        where: customerId
      });
      res.status(200).json({
        message: "Orders fetched Successfully",
        orders
      });
    } catch (error) {}
  };