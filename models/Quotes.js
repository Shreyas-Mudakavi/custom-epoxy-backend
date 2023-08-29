const mongoose = require("mongoose");

const quotesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    wood: {
      type: String,
      required: true,
    },
    shape: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    length: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    thickness: {
      type: Number,
      required: true,
    },
    placeOfUse: {
      type: String,
      required: true,
    },
    sectionOfBase: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

const quotesModel = mongoose.model("Quotes", quotesSchema);

module.exports = quotesModel;
