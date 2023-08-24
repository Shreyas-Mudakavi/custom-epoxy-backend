const express = require("express");
const {
  login,
  register,
  sendOtp,
  verifyMobileNumber,
  verifyMobileFrgPwd,
  changePassword,
} = require("../controllers/userController");
const router = express.Router();

router.post("/register", register);

router.post("/login", login);
router.post("/send-otp", sendOtp);

// for verifying otp for the login
router.post("/verify-otp", verifyMobileNumber);

// for verifying otp when forget password is used
router.post("/verify-otp-forget", verifyMobileFrgPwd);

// reset password
router.put("/reset-password", changePassword);

module.exports = router;
