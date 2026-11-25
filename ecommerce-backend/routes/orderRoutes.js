const express = require("express");
const {
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.route("/").get(getOrders).post(placeOrder);
router.get("/:id", getOrderById);
router.patch("/:id/status", authorize("admin"), updateOrderStatus);

module.exports = router;
