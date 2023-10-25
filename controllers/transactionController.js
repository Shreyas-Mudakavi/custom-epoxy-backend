const fs = require("fs");
const path = require("path");
const pdf = require("pdf-creator-node");
const { v4: uuid } = require("uuid");
const { s3UploadRportv2 } = require("../utils/s3");
const transactionModel = require("../models/Transactions");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const quotesModel = require("../models/Quotes");

const templateHtml = (templateName) => {
  const templatePath = path.join(__dirname, templateName);
  return fs.readFileSync(templatePath, "utf-8");
};

const options = {
  format: "A3",
  orientation: "portrait",
  border: "10mm",
  footer: {
    height: "10mm",
    contents: {
      default:
        '<span style="color: #444; float: right; margin-top: 20px;">{{page}}</span>',
    },
  },
};

const sendReport = async (templateName, data) => {
  // const sendReport = async (templateName, data, res) => {
  const report = await pdf.create(
    {
      html: templateHtml(templateName),
      data,
      path: "./output.pdf",
      type: "buffer",
    },
    options
  );

  // res.setHeader("Content-Type", "application/pdf");
  // console.log("reprt ", report);

  return report;
};

const formattedDate = (date) => {
  if (!date || isNaN(date)) return;
  return date.toISOString().split("T")[0];
};

const formatedTransaction = (transaction) => {
  transaction.createdAt = formattedDate(transaction.createdAt);
  return transaction;
};

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

exports.addTransaction = catchAsyncError(async (req, res, next) => {
  const { quoteId, paymentMethod, total, status } = req.body;

  const quote = await quotesModel.findById(quoteId);
  if (!quote) {
    return next(new ErrorHandler("No quote found!", 404));
  }

  const unique_id = uuid();
  const transactionId = unique_id.slice(0, 6);

  const newTransaction = await transactionModel.create({
    user: req.userId,
    quote: quoteId,
    status: status,
    transactionId: "#" + transactionId,
    paymentMethod: paymentMethod,
    total: total,
  });
  const savedTransaction = await newTransaction.save();

  const transaction = await transactionModel
    .findById(savedTransaction._id)
    .populate("user")
    .populate("quote");

  const report = await sendReport("singleReceipt.html", {
    heading: "CUSTOM EPOXY - Receipt",
    ...formatedTransaction(transaction.toJSON()),
  });
  const results = await s3UploadRportv2(report);

  const transactionDetials = await transactionModel
    .findByIdAndUpdate(
      { _id: transaction._id },
      { link: results.Location },
      { new: true }
    )
    .populate("quote")
    .populate("user");

  res.status(200).json({
    message: "Transaction details are as follows.",
    transaction: transactionDetials,
  });
});
