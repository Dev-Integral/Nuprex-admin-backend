const { DataTypes } = require("sequelize");
const sequelize = require("./index");
const bcrypt = require('bcryptjs');

const Customer = sequelize.define("Customer", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  isEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  emailProofToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emailProofTokenExpiresAt: {
    type: DataTypes.DATE,
  },
});
// Hash password before saving admin
Customer.beforeSave(async (admin, options) => {
  if (admin.changed("password")) {
    admin.password = await bcrypt.hash(admin.password, 10);
  }
});

Customer.prototype.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = Customer;
