const userModel = require("../models/User");
const jwt = require("jsonwebtoken");
const catchAsyncError = require("../utils/catchAsyncError");
const bcrypt = require("bcryptjs");
const ErrorHandler = require("../utils/errorHandler");

exports.register = catchAsyncError(async (req, res, next) => {
  console.log("user register", req.body);

  const { username, mobile_no, email, password, dateOfBirth, address, gender } =
    req.body;

  const userExists = await userModel.findOne({ email: email });
  if (userExists) {
    return next(new ErrorHandler("User already exists!", 409));
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const user = await userModel.create({
    username: username,
    email: email,
    password: hashedPassword,
    dateOfBirth: dateOfBirth,
    mobile: mobile_no,
    address: address,
    gender: gender,
  });

  await user.save();

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.status(201).json({ user: user, token: token, message: "User created!" });
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email: email });
  if (!user) {
    return next(new ErrorHandler("Invalid email or password!", 401));
  }

  const isMatch = bcrypt.compareSync(password, user.password);

  if (!isMatch) {
    return next(new ErrorHandler("Invalid email or password!", 401));
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.status(200).json({ user: user, token: token });
});
