const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    quote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotes",
      required: true,
    },
    status: {
      type: String,
      default: "Quote Requested",
      enum: [
        "Quote Received",
        "Quote Requested",
        "In Process",
        "Approved",
        "Manufacture",
        "Out For Delivery",
        "Delivered",
        "Cancelled",
      ],
    },
    paymentStatus: {
      type: String,
      default: "PENDING",
      enum: ["COMPLETED", "PENDING", "CANCELLED"],
    },
    orderNumber: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Online", "Offline"],
    },
    total: {
      type: Number,
      default: 0,
    },
  },

  {
    timestamps: true,
  }
);

const orderModel = mongoose.model("Orders", orderSchema);

module.exports = orderModel;
