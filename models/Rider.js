const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const Rider = sequelize.define("Rider", {
  riderId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  gender: {
    type: DataTypes.ENUM("male", "female"),
    allowNull: false,
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  creator: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  homeAddress: {
    type: DataTypes.STRING,
  },
  riderCode: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  vehicleType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isSuspended: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  reason: {
    type: DataTypes.STRING,
  },
});

module.exports = Rider;
