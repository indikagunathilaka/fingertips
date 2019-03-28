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
    subCode: { type: String, index: true },
    orderDate: {
      type: Date,
      required: [true, "Order date is required"],
      index: true
    },
    expectedDate: {
      type: Date,
      required: [true, "Expected date is required"],
      index: true
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
      default: "PENDING",
      index: true
    },
    comment: String,
    //items: [{ type: Schema.Types.ObjectId, ref: "OrderItem" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

PurchaseOrderSchema.plugin(diffHistory);

// create model for purchase order
const PurchaseOrder = mongoose.model("PurchaseOrder", PurchaseOrderSchema);

module.exports = PurchaseOrder;
