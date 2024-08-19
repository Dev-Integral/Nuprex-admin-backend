const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderControllers');
const { protectCustomer } = require('../middlewares/customerMiddlewares');
const { protectAdmin } = require('../middlewares/authMiddlewares');

// All order route (accessible to Admin only)
router.get('/', protectAdmin, orderController.getAllOrders);
// Create order route (accessible to Customer)
router.post('/create', protectCustomer, orderController.createOrder);

module.exports = router;