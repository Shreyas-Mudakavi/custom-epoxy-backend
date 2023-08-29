const transactionModel = require("../models/Transactions");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

exports.getAllTransactions = catchAsyncError(async (req, res, next) => {
  const transactions = await transactionModel
    .find({ user: req.userId })
    .populate("user")
    .populate("quote");

  if (transactions.length <= 0) {
    return next(new ErrorHandler("No transactions found!", 404));
  }

  res.status(200).json({
    message: "Transactions list are as follows",
    transactions: transactions,
  });
});
