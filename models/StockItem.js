const mongoos = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoos.Schema;

// create schema for Item
const StockItemSchema = new Schema(
  {
    code: {
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
    packingType: { type: Schema.Types.ObjectId, ref: "PackingType" },
    unitWeight: Number,
    unitWeightType: { type: Schema.Types.ObjectId, ref: "MeasuringType" },
    units: { type: Number, default: 0 },
    availableUnits: { type: Number, default: 0 },
    reservedUnits: { type: Number, default: 0 },
    returnUnits: { type: Number, default: 0 },
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
