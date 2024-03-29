const express = require("express");
const { auth } = require("../middlewares/auth");
const {
  getAllOrders,
  getOrder,
  cancelOrder,
  paymentOffline,
  negotiationOrder,
} = require("../controllers/orderController");
const router = express.Router();

router.get("/myOrders", auth, getAllOrders);
router.get("/getOrder/:id", auth, getOrder);
router.post("/negotiation/:id", auth, negotiationOrder);
router.post("/paymentOffline/:id", auth, paymentOffline);
router.delete("/cancelOrder/:id", auth, cancelOrder);

module.exports = router;
