const express = require("express");
const {
  login,
  register,
  sendOtp,
  verifyMobileNumber,
  verifyMobileFrgPwd,
  changePassword,
  getProfile,
  updateProfile,
  deleteAccont,
} = require("../controllers/userController");
const { auth } = require("../middlewares/auth");
const { upload } = require("../utils/s3");
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

router.get("/get-profile", auth, getProfile);

router.post("/image", upload.single("image"), postSingleImage);
router.put("/update-profile", auth,  updateProfile);

router.delete("/delete-account", auth, deleteAccont);

module.exports = router;
