const mongoose = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoose.Schema;

const DeliverySchema = new Schema(
  {
    deliveryNumber: {
      type: String,
      required: [true, "Reference number is required"],
    },
    deliveryNumberPrefix: { type: String, required: [true, "Reference number prefix is required"] },
    deliveryNumberSuffix: { type: String, required: [true, "Reference number suffix is required"] },
    vehicleNumber: {
      type: String,
      required: [true, "Vehicle number is required"],
    },
    departureDateTime: { type: Date, required: [true, "Date is required"] },
    arrivalDateTime: Date,
    materialRequests: [{ type: Schema.Types.ObjectId, ref: "MaterialRequest" }],
    items: [{ type: Schema.Types.ObjectId, ref: "DeliveryItem" }],
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
