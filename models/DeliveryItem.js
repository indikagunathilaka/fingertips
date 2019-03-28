const mongoos = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoos.Schema;

const DeliveryItemSchema = new Schema({
  receiveItem: { type: Schema.Types.ObjectId, ref: "ReceiveItem" },
  units: {
    type: Number,
    required: [true, "Number of units is required"]
  },
  deliveryRequest: { type: Schema.Types.ObjectId, ref: "DeliveryRequest" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
});

DeliveryItemSchema.plugin(diffHistory);

const DeliveryItem = mongoos.model("DeliveryItem", DeliveryItemSchema);

module.exports = DeliveryItem;
