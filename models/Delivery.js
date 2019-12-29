const mongoose = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoose.Schema;

const DeliverySchema = new Schema(
  {
    vehicleNumber: {
      type: String,
      required: [true, "Vehicle number is required"],
      index: true
    },
    departureDateTime: { type: Date, required: [true, "Date is required"] },
    arrivalDateTime: Date,
    materialRequest: { type: Schema.Types.ObjectId, ref: "MaterialRequest" },
    status: {
      type: String,
      enum: ["PENDING", "FACTORY_RECEIVED"],
      default: "PENDING",
      index: true
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

DeliverySchema.plugin(diffHistory);

const Delivery = mongoose.model("Delivery", DeliverySchema);

module.exports = Delivery;
