const mongoose = require("mongoose");

const productImageSchema = new mongoose.Schema(
  {
    wood: {
      type: String,
      required: true,
    },
    shape: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

const productImageModel = mongoose.model("productImage", productImageSchema);

module.exports = productImageModel;
