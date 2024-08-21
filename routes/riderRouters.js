const express = require("express");
const router = express.Router();
const riderController = require("../controllers/riderControllers");
const { protectAdmin } = require("../middlewares/authMiddlewares");

// Admin controlled Riders Routers
router.get("/", protectAdmin, riderController.getRiders);
router.get("/get-code", protectAdmin, riderController.getRiderCode);
router.get("/:riderId", protectAdmin, riderController.getRiderbyId);
router.post("/create", protectAdmin, riderController.createRider);
router.post("/suspend/:riderId", protectAdmin, riderController.suspendRider);
router.get("/activate/:riderId", protectAdmin, riderController.activateRider);
router.get("/activities/:riderId", protectAdmin, riderController.riderActivities);

module.exports = router;
