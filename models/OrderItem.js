const mongoos = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoos.Schema;

// create schema for Item
const OrderItemSchema = new Schema(
  {
    item: { type: Schema.ObjectId, ref: "ItemCategory" },
    lotNumber: { type: String, required: [true, "LOT number is required"] },
    units: {
      type: Number,
      required: [true, "Number of units is required"]
    },
    receivedUnits: { type: Number, default: 0 },
    pendingUnits: { type: Number, default: 0 },
    netWeight: {
      type: Number,
      required: [true, "Net weight is required"]
    },
    grossWeight: {
      type: Number,
      required: [true, "Gross weight is required"]
    },
    /* unitWeight: {
      type: Number,
      required: [true, "Unit weight is required"]
    }, */
    /* measuringType: { type: Schema.Types.ObjectId, ref: "MeasuringType" }, */

    /* totalQuantity: {
      type: Number,
      required: [true, "Total units are required"]
    },
    pendingQuantity: {
      type: Number,
      required: [true, "Pending units are required"]
    }, */
    purchaseOrder: { type: Schema.Types.ObjectId, ref: "PurchaseOrder" },
    /* receiveItems: [{ type: Schema.Types.ObjectId, ref: "ReceiveItem" }], */
    stockItem: { type: Schema.Types.ObjectId, ref: "StockItem" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);
OrderItemSchema.virtual("unitWeightType").get(() => {
  return this.orderUnitWeight + " " + this.orderMeasuringType.name;
});
OrderItemSchema.plugin(diffHistory);

// create model for Item
const OrderItem = mongoos.model("OrderItem", OrderItemSchema);

module.exports = OrderItem;
