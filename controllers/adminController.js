const orderModel = require("../models/Order");
const jwt = require("jsonwebtoken");
const userModel = require("../models/User");
const bcrypt = require("bcryptjs");
const APIFeatures = require("../utils/apiFeatures");
const catchAsyncError = require("../utils/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const quotesModel = require("../models/Quotes");
const transactionModel = require("../models/Transactions");
const productImageModel = require("../models/ProductImage");
const { s3Uploadv2, s3UploadMulti } = require("../utils/s3");

exports.adminLogin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  console.log(req.body);
  if (!email || !password)
    return next(new ErrorHandler("Please enter your email and password", 400));

  const user = await userModel.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("Invalid email or password", 401));

  if (user.role !== "admin")
    return next(new ErrorHandler("Unauthorized user login.", 401));

  const isPasswordMatched = await bcrypt.compareSync(password, user.password);

  if (!isPasswordMatched)
    return next(new ErrorHandler("Invalid email or password!", 401));

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.status(200).json({ user: user, token: token });
});

exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const userCount = await userModel.countDocuments();

  const apiFeature = new APIFeatures(
    userModel.find().sort({ createdAt: -1 }),
    req.query
  ).search("username");

  let users = await apiFeature.query;
  let filteredUserCount = users.length;
  if (req.query.resultPerPage && req.query.currentPage) {
    apiFeature.pagination();

    console.log("filteredUserCount", filteredUserCount);
    users = await apiFeature.query.clone();
  }

  res.status(200).json({ users, userCount, filteredUserCount });
});

exports.getUser = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.params.id);

  if (!user) return next(new ErrorHandler("User not found.", 404));

  res.status(200).json({ user: user });
});

exports.updateUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { username, mobile_no, address, role } = req.body;

  const userExists = await userModel.findById(id);

  if (!userExists) return next(new ErrorHandler("User not found.", 404));

  const user = await userModel.findByIdAndUpdate(
    id,
    { username, mobile_no, address, role },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    user: user,
  });
});

exports.deleteAccont = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }
  await userModel.findByIdAndDelete(req.userId);

  const order = await orderModel.findOne({ user: user._id });
  if (order) {
    await orderModel.findByIdAndDelete(order._id);
  }
  const quote = await quotesModel.findOne({ user: user._id });
  if (quote) {
    await quotesModel.findByIdAndDelete(quote._id);
  }

  res.status(200).json({
    message: "Account deleted successfully",
  });
});

exports.getAllOrders = catchAsyncError(async (req, res, next) => {
  console.log("req.query", req.query);

  let query = {};
  if (req.query.orderId) {
    query = {
      orderId: {
        $regex: req.query.orderId,
        $options: "i",
      },
    };
  }

  if (req.query.status !== "all") query.status = req.query.status;

  console.log("query", query);
  const apiFeature = new APIFeatures(
    orderModel
      .find(query)
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("quote"),
    req.query
  );

  let orders = await apiFeature.query;
  // console.log("orders", orders);
  let filteredOrderCount = orders.length;

  apiFeature.pagination();
  orders = await apiFeature.query.clone();

  res.status(200).json({ orders, filteredOrderCount });
});

exports.getOrderById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const order = await orderModel
    .findById(id)
    .sort({ createdAt: -1 })
    .populate("user")
    .populate("quote");

  if (!order) return next(new ErrorHandler("Order not found.", 404));

  res.status(200).json({ order: order });
});

exports.updateOrderStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status, netPrice, upfrontAmount, taxes, hiddenCost, total } =
    req.body;
  const order = await orderModel.findById(id);

  if (!order) return next(new ErrorHandler("Order not found.", 404));

  const updatedOrder = await orderModel.findByIdAndUpdate(
    id,
    {
      status,
      total,
      priceAsPerQuote: {
        netPrice,
        upfrontAmount,
        taxes,
        hiddenCost,
      },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({ order: updatedOrder });
});

exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let order = await orderModel.findById(id);
  if (!order) return next(new ErrorHandler("Order not found.", 404));

  await orderModel.findByIdAndDelete(id);

  res.status(200).json({
    message: "Order Deleted successfully.",
  });
});

exports.getAllQuotes = catchAsyncError(async (req, res, next) => {
  const quotesCount = await userModel.countDocuments();

  const apiFeature = new APIFeatures(
    quotesModel.find().sort({ createdAt: -1 }),
    req.query
  ).search("wood");

  let quotes = await apiFeature.query;
  let filteredQuotesCount = quotes.length;
  if (req.query.resultPerPage && req.query.currentPage) {
    apiFeature.pagination();

    console.log("filteredQuotesCount", filteredQuotesCount);
    quotes = await apiFeature.query.clone();
  }

  res.status(200).json({ quotes, quotesCount, filteredQuotesCount });
});

exports.getQuote = catchAsyncError(async (req, res, next) => {
  const quote = await quotesModel.findById(req.params.id).populate("user");

  if (!quote) return next(new ErrorHandler("Quote not found.", 404));

  res.status(200).json({ quote: quote });
});

exports.deleteQuote = catchAsyncError(async (req, res, next) => {
  const quote = await quotesModel.findById(req.params.id);

  if (!quote) return next(new ErrorHandler("Quote not found.", 404));
  await quotesModel.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: "Quote deleted" });
});

exports.getAllTransactions = catchAsyncError(async (req, res, next) => {
  console.log("req.query", req.query);

  let query = {};
  if (req.query.orderId) {
    query = {
      transactionId: {
        $regex: req.query.transactionId,
        $options: "i",
      },
    };
  }

  if (req.query.status !== "all") query.status = req.query.status;

  console.log("query", query);
  const apiFeature = new APIFeatures(
    transactionModel
      .find(query)
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("quote"),
    req.query
  );

  let transactions = await apiFeature.query;
  // console.log("transactions", transactions);
  let filteredTransactionsCount = transactions.length;

  apiFeature.pagination();
  transactions = await apiFeature.query.clone();

  res.status(200).json({ transactions, filteredTransactionsCount });
});

exports.getTransaction = catchAsyncError(async (req, res, next) => {
  const transaction = await transactionModel
    .findById(req.params.id)
    .populate("user")
    .populate("quote");

  if (!transaction)
    return next(new ErrorHandler("Transaction not found.", 404));

  res.status(200).json({ transaction: transaction });
});

exports.deleteTransaction = catchAsyncError(async (req, res, next) => {
  const transaction = await transactionModel.findById(req.params.id);

  if (!transaction)
    return next(new ErrorHandler("Transaction not found.", 404));
  await transactionModel.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: "Transaction deleted" });
});

exports.addProductImage = catchAsyncError(async (req, res, next) => {
  const { wood, color, shape, images } = req.body;

  // function getMultipleRandom(arr, num) {
  //   const shuffled = [...arr].sort(() => 0.5 - Math.random());

  //   return shuffled.slice(0, num);
  // }
  // const quoteImg = getMultipleRandom(images, 2);

  const alreadyImageExists = await productImageModel.findOne({
    wood: { $regex: wood, $options: "i" },
    shape: { $regex: shape, $options: "i" },
    color: { $regex: color, $options: "i" },
  });
  if (alreadyImageExists) {
    return next(new ErrorHandler("Image already added!", 409));
  }

  const addProductImage = await productImageModel.create({
    wood: wood,
    shape: shape,
    color: color,
    images: images,
  });

  const savedProductImage = await addProductImage.save();

  res.status(201).json({
    message: "Product image added!",
    savedProductImage: savedProductImage,
  });
});

exports.getAllQuoteImages = catchAsyncError(async (req, res, next) => {
  const quoteImagesCount = await productImageModel.countDocuments();

  let query = {};
  if (req.query.wood) {
    query = {
      wood: {
        $regex: req.query.wood,
        $options: "i",
      },
    };
  }

  if (req.query.wood !== "all") {
    query.wood = req.query.wood;

    console.log(req.query);

    const apiFeature = new APIFeatures(
      productImageModel.find(query).sort({ createdAt: -1 }),
      req.query
    );

    let quoteImages = await apiFeature.query;
    let filteredQuoteImagesCount = quoteImages.length;

    apiFeature.pagination();
    quoteImages = await apiFeature.query.clone();

    return res.status(200).json({ quoteImages, filteredQuoteImagesCount });
  }

  const apiFeature = new APIFeatures(
    productImageModel.find().sort({ createdAt: -1 }),
    req.query
  );

  let quoteImages = await apiFeature.query;
  let filteredQuoteImagesCount = quoteImages.length;
  if (req.query.resultPerPage && req.query.currentPage) {
    apiFeature.pagination();
    quoteImages = await apiFeature.query.clone();
  }

  res.status(200).json({ quoteImages, filteredQuoteImagesCount });
});

exports.deleteQuoteImage = catchAsyncError(async (req, res, next) => {
  const quoteImage = await productImageModel.findById(req.params.id);

  if (!quoteImage) return next(new ErrorHandler("Quote image not found.", 404));

  await productImageModel.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: "Quote image deleted." });
});

exports.getQuoteImage = catchAsyncError(async (req, res, next) => {
  const quoteImage = await productImageModel.findById(req.params.id);

  if (!quoteImage) return next(new ErrorHandler("Quote image not found.", 404));

  res.status(200).json({ quoteImage: quoteImage });
});

exports.postSingleImage = catchAsyncError(async (req, res, next) => {
  const file = req.file;
  if (!file) return next(new ErrorHandler("Invalid Image", 401));

  const results = await s3Uploadv2(file);
  const location = results.Location && results.Location;
  return res.status(201).json({ data: { location } });
});

exports.postMultipleImages = catchAsyncError(async (req, res, next) => {
  const files = req.files;
  if (files) {
    const results = await s3UploadMulti(files);
    console.log(results);
    let location = [];
    results.filter((result) => {
      location.push(result.Location);
    });
    return res.status(201).json({ data: { location } });
  } else {
    return next(new ErrorHandler("Invalid Image", 401));
  }
});
