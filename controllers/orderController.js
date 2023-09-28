const orderModel = require("../models/Order");
const transactionModel = require("../models/Transactions");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const { v4: uuid } = require("uuid");

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
  } else if (req.query.filter === "In Process") {
    const orders = await orderModel
      .find({ user: req.userId, status: "In Process" })
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
  const order = await orderModel
    .findById(req.params.id)
    .populate("user")
    .populate("quote");

  if (!order) {
    return next(new ErrorHandler("No order found!", 404));
  }

  res.status(200).json({
    message: "Order details are as follows",
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
    { status: "Cancelled" },
    { new: true }
  );

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

  const updatedOrder = await orderModel.findByIdAndUpdate(
    req.params.id,
    {
      status: "In Process",
      paymentMethod: "Offline",
      total: total,
    },
    { new: true }
  );

  const unique_id = uuid();
  const transactionId = unique_id.slice(0, 6);

  const newTransaction = await transactionModel.create({
    user: req.userId,
    quote: order.quote,
    transactionId: "#" + transactionId,
    paymentMethod: "Offline",
    total: total,
  });
  await newTransaction.save();

  res.status(200).json({
    message: "This transaction will be approved by admin shortly",
    updatedOrder: updatedOrder,
  });
});
