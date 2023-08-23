const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

app.use(express.json());
app.use(cors());

const error = require("./middlewares/error");
const userRoutes = require("./routers/userRoutes");

app.get("/", async (req, res) => {
  res.status(200).json({ msg: "Custom epoxy backend!!" });
});

app.use("/api/user", userRoutes);
app.use(error);

module.exports = app;
