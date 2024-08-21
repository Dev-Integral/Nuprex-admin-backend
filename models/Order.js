const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Order = sequelize.define('Order', {
  orderId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM("pickup", "delivery", "runErrands"),
    allowNull: false,
  },
  customerId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  currentLocation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
  },
  riderId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  txnId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  rating: {
    type: DataTypes.STRING,
    allowNull: true
  },
  orderReceived: {
    type: DataTypes.DATE,
    allowNull: true
  },
  riderAccepted: {
    type: DataTypes.STRING,
    allowNull: true
  },
  riderMoving: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM("pending", "completed", "cancelled"),
    allowNull: false,
    defaultValue: "pending"
  }
});

module.exports = Order;
