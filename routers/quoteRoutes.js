const express = require("express");
const { auth } = require("../middlewares/auth");
const { newQuote, getImage } = require("../controllers/quoteController");
const router = express.Router();

router.post("/new-quote", auth, newQuote);

router.post("/get-image", getImage);

module.exports = router;
