const mongoos = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoos.Schema;

const DeliveryItemSchema = new Schema(
  {
    requestItem: { type: Schema.Types.ObjectId, ref: "RequestItem" },
    units: {
      type: Number,
      required: [true, "Number of units is required"]
    },
    netWeight: { type: String },
    grossWeight: { type: String },
    stockItems: [{ type: Schema.Types.ObjectId, ref: "BinStock" }],
    delivery: { type: Schema.Types.ObjectId, ref: "Delivery" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

DeliveryItemSchema.plugin(diffHistory);

const DeliveryItem = mongoos.model("DeliveryItem", DeliveryItemSchema);

module.exports = DeliveryItem;
