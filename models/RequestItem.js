const mongoos = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoos.Schema;

// create schema for Material item
const RequestItemSchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: "ItemCategory" },
  lotNumber: { type: String, required: [true, "LOT number is required"] },
  units: {
    type: Number,
    required: [true, "Number of units is required"]
  },
  stockItems: [{ type: Schema.Types.ObjectId, ref: "BinStock" }],
  /* unitWeight: {
    type: Number,
    required: [true, "Unit weight is required"]
  },
  measuringType: { type: Schema.Types.ObjectId, ref: "MeasuringType" },
  totalQuantity: {
    type: Number,
    required: [true, "Total units are required"]
  }, */
  materialRequest: { type: Schema.Types.ObjectId, ref: "MaterialRequest" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
});

RequestItemSchema.plugin(diffHistory);

// create model for material item
const RequestItem = mongoos.model("RequestItem", RequestItemSchema);

module.exports = RequestItem;
