const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

app.use(express.json());
app.use(cors());

const error = require("./middlewares/error");
const userRoutes = require("./routers/userRoutes");
const quoteRoutes = require("./routers/quoteRoutes");
const orderRoutes = require("./routers/orderRoutes");
const transactionRoutes = require("./routers/transactionRoutes");
const adminRoutes = require("./routers/adminRoutes");

app.get("/", async (req, res) => {
  res.status(200).json({ msg: "Custom epoxy backend!!" });
});

app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/quote", quoteRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/transaction", transactionRoutes);
app.use(error);

module.exports = app;
