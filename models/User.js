const mongoose = require("mongoose");

const validateEmail = (email) => {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    img_url: {
      type: String,
      // required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [validateEmail, "Please fill a valid email address"],
    },
    password: {
      type: String,
      // required: true,
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    mobile: {
      type: Number,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },

  {
    timestamps: true,
  }
);

const userModel = mongoose.model("Users", userSchema);

module.exports = userModel;
