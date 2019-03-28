const mongoos = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoos.Schema;

// create schema for Material item
const RequestItemSchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: "StockItem" },
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
  materialRequest: { type: Schema.Types.ObjectId, ref: "MaterialRequest" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
});

RequestItemSchema.plugin(diffHistory);

// create model for material item
const RequestItem = mongoos.model("RequestItem", RequestItemSchema);

module.exports = RequestItem;
