const mongoose = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoose.Schema;

// create schema for purchase order
const PurchaseOrderSchema = new Schema(
  {
    code: {
      type: String,
      unique: true,
      required: [true, "Order number is required"],
      index: true
    },
    codePrefix: { type: String, required: [true, "Code prefix is required"] },
    codeSuffix: { type: String, required: [true, "Code suffix is required"] },
    orderDate: {
      type: Date,
      required: [true, "Order date is required"],
      index: true
    },
    expectedDate: {
      type: Date,
      required: [false, "Expected date is required"],
      index: true
    },
    netWeight: {
      type: Number,
      required: [false, "Net weight is required"]
    },
    grossWeight: {
      type: Number,
      required: [false, "Gross weight is required"]
    },
    receivedDate: { type: Date, index: true },
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier" },
    shipmentMode: [{ type: Schema.Types.ObjectId, ref: "ShipmentMode" }],
    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVAL_PENDING",
        "APPROVED",
        "CANCEL",
        "RECEIVE_PENDING",
        "COMPLETE"
      ],
      default: "APPROVED",
      index: true
    },
    comment: String,
    items: [{ type: Schema.Types.ObjectId, ref: "OrderItem" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

PurchaseOrderSchema.plugin(diffHistory);

// create model for purchase order
const PurchaseOrder = mongoose.model("PurchaseOrder", PurchaseOrderSchema);

module.exports = PurchaseOrder;
