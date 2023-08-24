const userModel = require("../models/User");
const jwt = require("jsonwebtoken");
const catchAsyncError = require("../utils/catchAsyncError");
const bcrypt = require("bcryptjs");
const ErrorHandler = require("../utils/errorHandler");
const dotenv = require("dotenv");
dotenv.config();

const client = require("twilio")(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN,
  {
    lazyLoading: true,
  }
);

exports.register = catchAsyncError(async (req, res, next) => {
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

exports.sendOtp = catchAsyncError(async (req, res, next) => {
  // extracting the country code and the mobile number for sending otp
  const { countryCode, phoneNumber } = req.body;

  if (!countryCode || !phoneNumber) {
    return next(new ErrorHandler("Enter all Required fields", 401));
  }

  // sending otp to the provided mobile number
  const otpResponse = await client.verify
    .services("VAf18466e31504db957862e60d5fba0872")
    .verifications.create({
      to: `+${countryCode}${phoneNumber}`,
      channel: "sms",
    });

  res.status(201).json({ msg: "OTP send succesfully!" });
});

exports.verifyMobileNumber = catchAsyncError(async (req, res, next) => {
  // extracting info for verifying otp for login
  const { countryCode, phoneNumber, otp, password } = req.body;

  if (!countryCode || !phoneNumber || !otp) {
    return next(new ErrorHandler("Enter all Required fields", 401));
  }

  // finding the user with the given phone number
  const user = await userModel.findOne({ mobile: phoneNumber });

  // verifying otp
  const verificationResponse = await client.verify
    .services("VAf18466e31504db957862e60d5fba0872")
    .verificationChecks.create({
      to: `+${countryCode}${phoneNumber}`,
      code: otp,
    });

  if (verificationResponse.valid) {
    // otp verified but user does not exists
    if (!user) {
      return res.status(200).json({
        message: "User is not registered!",
        status: "Otp verified!",
        phoneNumber: phoneNumber,
      });
    }

    // comparing passwords
    const decryptedPw = await bcrypt.compare(password, user.password);
    if (!decryptedPw) {
      return next(new ErrorHandler("Invalid email or password!", 401));
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.status(200).json({ user, token });
  } else {
    return next(new ErrorHandler("Wrong OTP!", 400));
  }
});

exports.verifyMobileFrgPwd = catchAsyncError(async (req, res, next) => {
  // extracting info for verifying otp when forget password is used
  const { countryCode, phoneNumber, otp } = req.body;

  if (!countryCode || !phoneNumber || !otp) {
    return res.status(401).json({ msg: "Enter all Required fields" });
  }

  const verificationResponse = await client.verify
    .services("VAc5765b2512a65da35cbf9e3e352d67e6")
    .verificationChecks.create({
      to: `+${countryCode}${phoneNumber}`,
      code: otp,
    });

  if (verificationResponse.valid) {
    return res.status(200).json({
      status: "Otp verified!",
      phoneNumber: phoneNumber,
    });
  } else {
    return next(new ErrorHandler("Wrong OTP!", 400));
  }
});

exports.changePassword = catchAsyncError(async (req, res, next) => {
  // changing password
  const { password, mobile } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPwd = await bcrypt.hash(password, salt);

  const user = await userModel.findOne({ mobile: mobile });

  if (!user) {
    return next(new ErrorHandler("User not registered!", 404));
  }

  user.password = hashedPwd;
  await user.save();

  res.status(200).json({ msg: "Password updated!" });
});
