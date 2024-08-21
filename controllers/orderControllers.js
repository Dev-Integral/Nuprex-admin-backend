const Admin = require("../models/Admin");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const { Op } = require("sequelize");

exports.createOrder = async (req, res) => {
  const { currentLocation, destination, riderId, amount, type } = req.body;
  const { customerId } = req.customer;
  try {
    // Check if the customer exists using the customerId
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
      order,
    });
  } catch (error) {
    return res.status(500).json({ error: error["message"] });
  }
};
exports.getAllOrders = async (req, res) => {
  const { adminId } = req.admin;
  const {
    page = 1,
    limit = 10,
    type,
    status,
    startDate,
    endDate,
    paginate = "false",
  } = req.query;

  try {
    // Check if the admin exists using the adminId
    const admin = await Admin.findOne({ where: { adminId } });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Build the query filter
    const filter = {};

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    if (startDate && endDate) {
      filter.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      filter.createdAt = {
        [Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      filter.createdAt = {
        [Op.lte]: new Date(endDate),
      };
    }

    let orders;
    if (paginate === "true") {
      // Apply pagination
      const offset = (page - 1) * limit;

      orders = await Order.findAndCountAll({
        where: filter,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({
        message: "Orders fetched successfully",
        currentPage: parseInt(page),
        totalPages: Math.ceil(orders.count / limit),
        totalOrders: orders.count,
        orders: orders.rows,
      });
    } else {
      // No pagination
      orders = await Order.findAll({
        where: filter,
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({
        message: "Orders fetched successfully",
        totalOrders: orders.length,
        orders,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};
exports.getOrderById = async (req, res) => {
  const { orderId } = req.params;
  const { adminId } = req.admin;

  try {
    const admin = await Admin.findOne({ where: { adminId } });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    // Find the order by ID
    const order = await Order.findOne({ where: { orderId } });

    // If the order is not found, return a 404 error
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Return the order details
    res.status(200).json({
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
