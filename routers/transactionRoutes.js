const express = require("express");
const { auth } = require("../middlewares/auth");
const { getAllTransactions } = require("../controllers/transactionController");

const router = express.Router();

router.get("/myTransactions", auth, getAllTransactions);

module.exports = router;
