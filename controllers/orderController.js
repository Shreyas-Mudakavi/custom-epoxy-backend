const fs = require("fs");
const path = require("path");
const pdf = require("pdf-creator-node");
const { s3UploadRportv2 } = require("../utils/s3");
const orderModel = require("../models/Order");
const transactionModel = require("../models/Transactions");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const { v4: uuid } = require("uuid");

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

exports.getAllOrders = catchAsyncError(async (req, res, next) => {
  if (req.query.filter === "all") {
    const orders = await orderModel
      .find({ user: req.userId })
      .populate("user")
      .populate("quote");

    if (orders.length <= 0) {
      return next(new ErrorHandler("No orders found!", 404));
    }

    return res.status(200).json({
      message: "Orders list are as follows",
      orders: orders,
    });
  } else if (req.query.filter === "Quote Received") {
    const orders = await orderModel
      .find({ user: req.userId, status: "Quote Received" })
      .populate("user")
      .populate("quote");

    if (orders.length <= 0) {
      return next(new ErrorHandler("No orders found!", 404));
    }

    return res.status(200).json({
      message: "Orders list are as follows",
      orders: orders,
    });
  } else if (req.query.filter === "Quote Requested") {
    const orders = await orderModel
      .find({ user: req.userId, status: "Quote Requested" })
      .populate("user")
      .populate("quote");

    if (orders.length <= 0) {
      return next(new ErrorHandler("No orders found!", 404));
    }

    return res.status(200).json({
      message: "Orders list are as follows",
      orders: orders,
    });
  } else if (req.query.filter === "In Progress") {
    const orders = await orderModel
      .find({ user: req.userId, status: "In Progress" })
      .populate("user")
      .populate("quote");

    if (orders.length <= 0) {
      return next(new ErrorHandler("No orders found!", 404));
    }

    return res.status(200).json({
      message: "Orders list are as follows",
      orders: orders,
    });
  } else if (req.query.filter === "Approved") {
    const orders = await orderModel
      .find({ user: req.userId, status: "Approved" })
      .populate("user")
      .populate("quote");

    if (orders.length <= 0) {
      return next(new ErrorHandler("No orders found!", 404));
    }

    return res.status(200).json({
      message: "Orders list are as follows",
      orders: orders,
    });
  } else if (req.query.filter === "Manufacture") {
    const orders = await orderModel
      .find({ user: req.userId, status: "Manufacture" })
      .populate("user")
      .populate("quote");

    if (orders.length <= 0) {
      return next(new ErrorHandler("No orders found!", 404));
    }

    return res.status(200).json({
      message: "Orders list are as follows",
      orders: orders,
    });
  } else if (req.query.filter === "Out For Delivery") {
    const orders = await orderModel
      .find({ user: req.userId, status: "Out For Delivery" })
      .populate("user")
      .populate("quote");

    if (orders.length <= 0) {
      return next(new ErrorHandler("No orders found!", 404));
    }

    return res.status(200).json({
      message: "Orders list are as follows",
      orders: orders,
    });
  } else if (req.query.filter === "Delivered") {
    const orders = await orderModel
      .find({ user: req.userId, status: "Delivered" })
      .populate("user")
      .populate("quote");

    if (orders.length <= 0) {
      return next(new ErrorHandler("No orders found!", 404));
    }

    return res.status(200).json({
      message: "Orders list are as follows",
      orders: orders,
    });
  }
});

exports.getOrder = catchAsyncError(async (req, res, next) => {
  let order;
  let pdf;
  const orderDetails = await orderModel
    .findById(req.params.id)
    .populate("user")
    .populate("quote")
    .populate("transaction");

  if (!orderDetails) {
    return next(new ErrorHandler("No order found!", 404));
  }

  if (
    orderDetails.transaction.length <= 0 &&
    orderDetails.Outstanding_amount <= 0
  ) {
    // no price and trans...
    order = await orderModel
      .findById(req.params.id)
      .select(["-priceAsPerQuote", "-Outstanding_amount", "-transaction"])
      .populate("user")
      .populate("quote");
  } else if (
    orderDetails.transaction.length <= 0 &&
    orderDetails.Outstanding_amount > 0
  ) {
    // no trans but price...
    order = await orderModel
      .findById(req.params.id)
      .select("-transaction")
      .populate("user")
      .populate("quote");
  } else if (
    orderDetails.Outstanding_amount <= 0 &&
    orderDetails.transaction.length > 0
  ) {
    // no price but trans...
    order = await orderModel
      .findById(req.params.id)
      .select(["-priceAsPerQuote", "-Outstanding_amount"])
      .populate("user")
      .populate("quote")
      .populate("transaction");
  } else {
    // price and trans...
    order = orderDetails;
  }

  if (order.priceAsPerQuote.total > 0) {
    // if (order.Outstanding_amount > 0) {
    order.createdAt = formattedDate(order.createdAt);

    const report = await sendReport("receipt.html", {
      heading: "CUSTOM EPOXY - Price breakdown",
      ...formatedOrder(order.toJSON()),
    });

    const results = await s3UploadRportv2(report);

    pdf = {
      link: results.Location,
      updatedAt: order.updatedAt,
    };
  }

  let screen_message;
  let progress_status;
  let progress_text = [
    "Quote Requested",
    "Quote Received",
    "Quote Accepted",
    "In Progress",
    "Approved",
    "Manufacture",
    "Out For Delivery",
    "Delivered",
  ];
  if (order?.status === "Quote Requested") {
    screen_message = [
      "Your Quote is being reviewed by admin",
      "Quote to be sent to you very shortly. Thanks for being patient.",
    ];
  } else if (order?.negotiation) {
    screen_message = [
      "You Have Requested For Negotiation",
      "Our Executive Will Get in Touch With You Shortly!",
    ];
  } else if (
    order?.status === "Quote Accepted" &&
    order?.Outstanding_amount > 0
  ) {
    screen_message = [
      "You Have An Outstanding Due",
      "Our Executive Will Get in Touch With You Shortly. Thanks for being patient.",
    ];
  } else {
    screen_message = [];
  }
  progress_status = progress_text.indexOf(order?.status) + 1;

  let progress;
  if (progress_status === 1) {
    progress = {
      progress_text: progress_text,
    };
  } else {
    progress = {
      progress_text: progress_text,
      progress_status: progress_status,
    };
  }

  res.status(200).json({
    message: "Order details are as follows",
    screen_message: screen_message,
    progress: progress,
    pdf,
    order: order,
  });
});

exports.negotiationOrder = catchAsyncError(async (req, res, next) => {
  let order;
  const orderDetails = await orderModel.findById(req.params.id);

  if (!orderDetails) {
    return next(new ErrorHandler("Invalid order id!", 404));
  }

  const updateNegotiation = await orderModel
    .findByIdAndUpdate(req.params.id, { negotiation: true }, { new: true })
    .populate("user")
    .populate("quote")
    .populate("transaction");

  if (updateNegotiation.transaction.length <= 0) {
    order = await orderModel
      .findByIdAndUpdate(req.params.id, { negotiation: true }, { new: true })
      .select("-transaction")
      .populate("user")
      .populate("quote");
  } else {
    order = updateNegotiation;
  }

  res.status(200).json({
    message: "Order details are as follows",
    screen_message: [
      "You Have Requested For Negotiation",
      "Our Executive Will Get in Touch With You Shortly!",
    ],
    order: order,
  });
});

exports.cancelOrder = catchAsyncError(async (req, res, next) => {
  const order = await orderModel.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Invalid order id!", 404));
  }

  // await orderModel.findByIdAndDelete(req.params.id);

  const updatedOrder = await orderModel.findByIdAndUpdate(
    req.params.id,
    { status: "Cancelled", paymentMethod: "CANCELLED" },
    { new: true }
  );

  const transaction = await transactionModel.findOne({ user: order.user });
  if (transaction) {
    await transactionModel.findByIdAndUpdate(transaction._id, {
      status: "CANCELLED",
    });
  }

  res.status(200).json({
    message: "Quote request cancelled",
    updatedOrder: updatedOrder,
  });
});

exports.paymentOffline = catchAsyncError(async (req, res, next) => {
  const { total } = req.body;

  const order = await orderModel.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("No order found!", 404));
  }

  const unique_id = uuid();
  const transactionId = unique_id.slice(0, 6);

  const newTransaction = await transactionModel.create({
    user: req.userId,
    quote: order.quote,
    transactionId: "#" + transactionId,
    paymentMethod: "Offline",
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

  await transactionModel.findByIdAndUpdate(
    { _id: transaction._id },
    { link: results.Location },
    { new: true }
  );

  await orderModel.updateOne(
    { _id: req.params.id },
    {
      $push: { transaction: newTransaction.id },
    }
  );

  const updatedOrder = await orderModel
    .findByIdAndUpdate(
      req.params.id,
      {
        status: "Quote Accepted",
        paymentMethod: "Offline",
        // "priceAsPerQuote.total": total,
        Outstanding_amount: order.Outstanding_amount - total,
      },
      { new: true }
    )
    .populate("user")
    .populate("quote")
    .populate("transaction");

  res.status(200).json({
    message: "Offline Payment",
    screen_message: [
      "PAYMENT verification",
      "This transaction will be approved by admin shortly",
    ],
    updatedOrder: updatedOrder,
  });
});
