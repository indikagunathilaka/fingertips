const mongoose = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoose.Schema;

// create schema for mode of shipment
const ShipmentModeSchema = new Schema({
  name: {
    type: String,
    required: [true, "Shipment mode name is require"],
    index: true
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: "ShipmentMode"
  },
  children: [
    {
      type: Schema.Types.ObjectId,
      ref: "ShipmentMode"
    }
  ],
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
});

ShipmentModeSchema.plugin(diffHistory);

// create model for ShipmentMode
const ShipmentMode = mongoose.model("ShipmentMode", ShipmentModeSchema);

module.exports = ShipmentMode;
