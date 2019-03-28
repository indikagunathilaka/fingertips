const mongoos = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoos.Schema;

// create schema for Item
const ReceiveItemSchema = new Schema(
  {
    item: { type: Schema.ObjectId, ref: "StockItem" },
    unitWeight: {
      type: Number,
      required: [true, "Unit weight is required"]
    },
    measuringType: { type: Schema.Types.ObjectId, ref: "MeasuringType" },
    units: {
      type: Number,
      required: [true, "Number of units is required"]
    },
    totalQuantity: {
      type: Number,
      required: [true, "Total units are required"]
    },
    availableQuantity: {
      type: Number,
      required: [true, "Available units are required"]
    },
    purchaseOrder: { type: Schema.Types.ObjectId, ref: "PurchaseOrder" },
    returnOrder: { type: Schema.Types.ObjectId, ref: "ReturnOrder" },
    type: {
      type: String,
      enum: ["STOCK", "RETURN", "CLEARED"],
      default: "STOCK"
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

ReceiveItemSchema.plugin(diffHistory);
/* ReceiveItemSchema.post("save", doc => {
  StockItem.findById(doc.item, (err, stockItem) => {
    if (data) {
      stockItem.units += doc.totalQuantity;
      stockItem.availableQuantity += doc.totalQuantity;
      stockItem.save();
    }
  });
}); */

// create model for Item
const ReceiveItem = mongoos.model("ReceiveItem", ReceiveItemSchema);

module.exports = ReceiveItem;
