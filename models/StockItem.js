const mongoos = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoos.Schema;

// create schema for Item
const StockItemSchema = new Schema(
  {
    /* code: {
      type: String,
      required: [true, "Item code is required"],
      index: true
    },
    name: {
      type: String,
      required: [true, "Item name is required"],
      index: true
    },
    madeOf: {
      type: String,
      required: [true, "Item made of is requied"],
      index: true
    },
    colour: { type: String, required: [true, "Item colour is required"] },
    packingType: { type: Schema.Types.ObjectId, ref: "PackingType" }, */
    item: { type: Schema.Types.ObjectId, ref: "ItemCategory" },
    orderItem: { type: Schema.Types.ObjectId, ref: "OrderItem" },
    bin: { type: Schema.Types.ObjectId, required: true, ref: "Bin" },
    unitWeight: Number,
    unitWeightType: { type: Schema.Types.ObjectId, ref: "MeasuringType" },
    units: Number,
    availableUnits: Number,
    reservedUnits: Number,
    returnUnits: Number,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);
StockItemSchema.virtual("unitWeightText").get(() => {
  return this.unitWeight + " " + this.unitWeightType.name;
});
StockItemSchema.plugin(diffHistory);

// create model for StockItem
const StockItem = mongoos.model("StockItem", StockItemSchema);

module.exports = StockItem;
