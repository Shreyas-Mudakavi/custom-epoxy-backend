const express = require("express");
const { auth } = require("../middlewares/auth");
const {
  getReceipt,
  getOrderReceipt,
  getTransactionReceipt,
} = require("./pdfController");
const router = express.Router();

router.get("/:id", auth, getReceipt);

router.get("/receipt/:id", auth, getOrderReceipt);

router.get("/transactionReceipt/:id", auth, getTransactionReceipt);

module.exports = router;
