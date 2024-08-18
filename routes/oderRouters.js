const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderControllers');
const { protectCustomer } = require('../middlewares/customerMiddlewares');

// Create order route (accessible to Customer)
router.post('/create', protectCustomer, orderController.createOrder);

module.exports = router;