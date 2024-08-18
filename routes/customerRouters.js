const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerControllers');
const { protectCustomer } = require('../middlewares/customerMiddlewares');

// Create customer route (accessible to Customers)
router.post('/create', customerController.create);
// Login customer route ()Accessible to customers)
router.post('/login', customerController.login);
// Verify customer route ()Accessible to customers)
router.post('/verify', customerController.verifyEmail);

module.exports = router;