const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Admin = require('./Admin');

const Notification = sequelize.define('Notification', {
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  viewBy: {
    type: DataTypes.ENUM("all", "admin", "superadmin"),
    allowNull: false,
    defaultValue: 'all',
  }

});

module.exports = Notification;