const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
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
      default: "PENDING",
      enum: ["COMPLETED", "PENDING", "CANCELLED"],
    },
    transactionId: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Offline", "Online"],
    },
    total: {
      type: Number,
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

const transactionModel = mongoose.model("Transactions", transactionSchema);

module.exports = transactionModel;
