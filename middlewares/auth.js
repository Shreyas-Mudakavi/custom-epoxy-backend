const jwt = require("jsonwebtoken");
const userModel = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const dotenv = require("dotenv");
dotenv.config();

exports.auth = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send({
        error: {
          message: `Unauthorized.Please Send token in request header`,
        },
      });
    }

    const { userId } = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    console.log("userId ", userId);

    req.userId = userId;

    const userValid = await userModel.find({ _id: userId });

    if (!userValid) {
      return res.status(401).send({ error: { message: `Unauthorized` } });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).send({ error: { message: `Unauthorized` } });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId).select("+password");

    if (!user)
      return next(new ErrorHandler("Invalid token. User not found.", 401));

    if (user.role !== "admin")
      return next(new ErrorHandler("Restricted.", 401));

    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Unauthorized.", 401));
  }
};

exports.isIntermediary = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId).select("+password");

    if (!user)
      return next(new ErrorHandler("Invalid token. User not found.", 401));

    if (user.role !== "intermediary")
      return next(new ErrorHandler("Restricted.", 401));

    req.user = user._id;
    req.userRole = user.role;

    next();
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Unauthorized.", 401));
  }
};
