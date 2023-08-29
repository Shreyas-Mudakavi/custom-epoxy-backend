const express = require("express");
const { auth } = require("../middlewares/auth");
const { newQuote } = require("../controllers/quoteController");
const router = express.Router();

router.post("/new-quote", auth, newQuote);

module.exports = router;
