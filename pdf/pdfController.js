const fs = require("fs");
const path = require("path");
const pdf = require("pdf-creator-node");

const ErrorHandler = require("../utils/errorHandler");
const orderModel = require("../models/Order");
const catchAsyncError = require("../utils/catchAsyncError");
const { s3UploadRportv2 } = require("../utils/s3");
const transactionModel = require("../models/Transactions");

// Read HTML Template
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

const formatedOrder = (order) => {
  order.updatedAt = formattedDate(order.updatedAt);
  return order;
};

const formatedTransaction = (transaction) => {
  transaction.createdAt = formattedDate(transaction.createdAt);
  return transaction;
};

exports.getReceipt = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new ErrorHandler("Please provide the Order ID", 400));

  var order = await orderModel.findById(id).populate("user");
  if (!order) return next(new ErrorHandler("Order not found.", 404));

  order.createdAt = formattedDate(order.createdAt);
  // console.log({ order });

  const report = await sendReport("receipt.html", {
    heading: "CUSTOM EPOXY - Price breakdown",
    ...formatedOrder(order.toJSON()),
  });

  const results = await s3UploadRportv2(report);
  // console.log("res ", results);

  // res.setHeader("Content-Type", "application/pdf");
  res.status(200).json({ link: results.Location, updatedAt: order.updatedAt });
});

exports.getOrderReceipt = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new ErrorHandler("Please provide the Order ID", 400));

  var order = await orderModel
    .findById(id)
    .populate("user")
    .populate("quote")
    .populate("transaction");
  if (!order) return next(new ErrorHandler("Order not found.", 404));

  order.createdAt = formattedDate(order.createdAt);
  // console.log({ order });

  const report = await sendReport("orderReceipt.html", {
    heading: "CUSTOM EPOXY - Receipt",
    ...formatedOrder(order.toJSON()),
  });

  const results = await s3UploadRportv2(report);
  // console.log("res ", results);

  // res.setHeader("Content-Type", "application/pdf");
  res.status(200).json({ link: results.Location });
});

exports.getTransactionReceipt = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (!id)
    return next(new ErrorHandler("Please provide the Transaction ID", 400));

  var transaction = await transactionModel
    .findById(id)
    .populate("user")
    .populate("quote");

  if (!transaction)
    return next(new ErrorHandler("Transaction not found.", 404));

  // transaction.createdAt = formattedDate(transaction.createdAt);

  const report = await sendReport("singleReceipt.html", {
    heading: "CUSTOM EPOXY - Receipt",
    ...formatedTransaction(transaction.toJSON()),
  });

  const results = await s3UploadRportv2(report);
  // console.log("res ", results);

  // res.setHeader("Content-Type", "application/pdf");
  res.status(200).json({ link: results.Location });
});
