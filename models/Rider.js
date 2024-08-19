const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const Rider = sequelize.define("Rider", {
  riderId: {
    type: DataTypes.STRING,
    allowNull: false,
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
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  homeAddress: {
    type: DataTypes.DECIMAL(10, 2),
  },
  riderCode: {
    type: DataTypes.STRING,
    allowNull: true,
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
});

module.exports = Rider;
