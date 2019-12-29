const mongoos = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoos.Schema;

// create schema for Item
const ItemCategorySchema = new Schema(
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
      /* required: [true, "Item made of is requied"], */
      index: true
    },
    colour: { type: String/* , required: [true, "Item colour is required"] */ },
    packingType: { type: Schema.Types.ObjectId, ref: "PackingType" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);
ItemCategorySchema.plugin(diffHistory);

// create model for StockItem
const ItemCategory = mongoos.model("ItemCategory", ItemCategorySchema);

module.exports = ItemCategory;
