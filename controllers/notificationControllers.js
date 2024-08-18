const Notification = require('../models/Notification');
const Admin = require('../models/Admin');

exports.createNotification = async (req, res) => {
  const { message, id } = req.body;

  try {
    // Check if the admin exists using the userId
    const admin = await Admin.findOne({ where: { userId } });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Create a new notification
    const notification = await Notification.create({
      message,
      userId, // Associate the notification with the admin using userId
    });

    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllNotifications = async (req, res) => {
    try {
      const notifications = await Notification.findAll({
        include: [{
          model: Admin,
          as: 'admin',
          attributes: ['userId', 'username', 'email', 'role'], // Include admin details
        }],
      });
      res.status(200).json({ success: true, data: notifications });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  };