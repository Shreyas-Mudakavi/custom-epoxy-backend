const catchAsyncError = require("../utils/catchAsyncError");
const orderModel = require("../models/Order");
const quotesModel = require("../models/Quotes");
const { v4: uuid } = require("uuid");
const productImageModel = require("../models/ProductImage");
const ErrorHandler = require("../utils/errorHandler");

exports.newQuote = catchAsyncError(async (req, res, next) => {
  const {
    wood,
    shape_of_table,
    color_fill,
    place_of_use,
    length,
    width,
    thickness,
    section_of_base,
    description,
  } = req.body;

  const newQuote = await quotesModel.create({
    user: req.userId,
    wood: wood,
    shape: shape_of_table,
    color: color_fill,
    length: length,
    width: width,
    thickness: thickness,
    placeOfUse: place_of_use,
    sectionOfBase: section_of_base,
    description: description,
  });

  const savedQuote = await newQuote.save();

  const unique_id = uuid();
  const orderNumber = unique_id.slice(0, 6);

  const newOrder = await orderModel.create({
    user: req.userId,
    quote: savedQuote._id,
    orderNumber: "#" + orderNumber,
  });
  await newOrder.save();

  res.status(201).json({
    message: "Quote request successful",
    quote_descripition: savedQuote,
  });
});

exports.getImage = catchAsyncError(async (req, res, next) => {
  const { wood, color, shape } = req.body;

  const tableImage = await productImageModel
    .findOne({
      wood: { $regex: wood, $options: "i" },
      shape: { $regex: shape, $options: "i" },
      color: { $regex: color, $options: "i" },
    })
    .select("image");

  if (!tableImage) {
    return next(new ErrorHandler("Image will be added soon!", 404));
  }

  res.status(200).json({
    message: "Quote image",
    image: tableImage,
  });
});
