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
    transaction: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transactions",
      },
    ],
    status: {
      type: String,
      default: "Quote Requested",
      enum: [
        "Quote Received",
        "Quote Requested",
        "Quote Accepted",
        "In Progress",
        "Approved",
        "Manufacture",
        "Out For Delivery",
        "Delivered",
        "Cancelled",
      ],
    },
    // paymentStatus: {
    //   type: String,
    //   default: "PENDING",
    //   enum: ["COMPLETED", "PENDING", "CANCELLED"],
    // },
    orderNumber: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Online", "Offline"],
    },
    priceAsPerQuote: {
      netPrice: {
        type: Number,
        default: 0,
      },
      upfrontAmount: {
        type: Number,
        default: 0,
      },
      taxes: {
        type: Number,
        default: 0,
      },
      hiddenCost: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        default: 0,
      },
    },
    Outstanding_amount: {
      type: Number,
      default: 0,
    },
    negotiation: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

const orderModel = mongoose.model("Orders", orderSchema);

module.exports = orderModel;
