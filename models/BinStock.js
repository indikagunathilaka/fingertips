const mongoose = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoose.Schema;

// Create a schema for BinStock
const BinStockSchema = new Schema(
  {
    bin: { type: Schema.Types.ObjectId, required: true, ref: "Bin" },
    orderItem: { type: Schema.Types.ObjectId, require: true, ref: "OrderItem" },
    runningNumber: {
      type: String,
      required: [true, "Running number is required"]
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "RESERVED", "DISPATCHED", "FACTORY_RECEIVED"],
      default: "AVAILABLE"
    },
    detailsStatus: {
      type: String,
      enum: ["PENDING", "COMPLETE"],
      default: "PENDING"
    },
    netWeight: { type: Number },
    grossWeight: { type: Number },
    cones: { type: Number },
    lotNumber: { type: String },
    itemCode: { type: String },
    binCode: { type: String },
    dispatchedTime: { type: Date },
    receivedTime: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

BinStockSchema.plugin(diffHistory);

// Create model for BinStock
const BinStock = mongoose.model("BinStock", BinStockSchema);

module.exports = BinStock;
