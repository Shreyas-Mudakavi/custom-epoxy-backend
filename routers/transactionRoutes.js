const express = require("express");
const { auth } = require("../middlewares/auth");
const {
  getAllTransactions,
  addTransaction,
} = require("../controllers/transactionController");

const router = express.Router();

router.get("/myTransactions", auth, getAllTransactions);

router.post("/addTransaction", auth, addTransaction);

module.exports = router;
