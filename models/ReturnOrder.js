const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create schema for materialRequest request
const ReturnOrderSchema = new Schema(
  {
    refNumber: {
      type: String,
      unique: true,
      required: [true, "Reference number is required"],
      index: true
    },
    returnLocation: {
      type: String,
      required: [true, "Return location is required"]
    },
    returnedDate: { type: Date, required: [true, "Return date is required"] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const ReturnOrder = mongoose.model("ReturnOrder", ReturnOrderSchema);

module.exports = ReturnOrder;
