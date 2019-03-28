const mongoose = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoose.Schema;

const DeliveryRequestSchema = new Schema(
  {
    materialRequest: { type: Schema.Types.ObjectId, ref: "MaterialRequest" },
    //items: [{ type: Schema.Types.ObjectId, ref: "DeliveryItem" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

DeliveryRequestSchema.plugin(diffHistory);

const DeliveryRequest = mongoose.model(
  "DeliveryRequest",
  DeliveryRequestSchema
);

module.exports = DeliveryRequest;
