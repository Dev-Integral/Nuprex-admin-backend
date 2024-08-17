const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const bcrypt = require('bcryptjs');

const Admin = sequelize.define('Admin', {
  fullname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  adminId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
  },
  isSuspended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  suspenseReason:{
    type: DataTypes.STRING
  },
  role: {
    type: DataTypes.ENUM('superadmin', 'admin'),
    allowNull: false,
    defaultValue: 'admin',
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emailProofToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emailProofTokenExpiresAt: {
    type: DataTypes.DATE,
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },

});

// Hash password before saving admin
Admin.beforeSave(async (admin, options) => {
  if (admin.changed('password')) {
    admin.password = await bcrypt.hash(admin.password, 10);
  }
});

Admin.prototype.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = Admin;
