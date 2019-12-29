const mongoose = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoose.Schema;

// create schema for materialRequest request
const MaterialRequestSchema = new Schema(
  {
    refNumber: {
      type: String,
      unique: true,
      required: [true, "Reference number is required"],
      index: true
    },
    deliveryLocation: {
      type: String,
      required: [true, "Delivery location is required"]
    },
    requestedDate: { type: Date, required: [true, "Order date is required"] },
    contactPerson: {
      type: String,
      required: [true, "Contact person is required"]
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"]
    },
    items: [{ type: Schema.Types.ObjectId, ref: "RequestItem" }],
    /* status: { type: String }, */
    status: {
      type: String,
      enum: [
        "PENDING",
        "DELIVERY_REQUEST",
        "DELIVERY",
        "COMPLETE"
      ],
      default: "PENDING"
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

MaterialRequestSchema.plugin(diffHistory);

// create model for purchase order
const MaterialRequest = mongoose.model(
  "MaterialRequest",
  MaterialRequestSchema
);

module.exports = MaterialRequest;
