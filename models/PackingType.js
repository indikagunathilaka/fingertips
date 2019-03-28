const mongoose = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoose.Schema;

// create schema for packing type
const PackingTypeSchema = new Schema({
  name: {
    type: String,
    required: [true, "Packing type name is required"],
    index: true
  },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
});

PackingTypeSchema.plugin(diffHistory);

// create model for packing type
const PackingType = mongoose.model("PackingType", PackingTypeSchema);

module.exports = PackingType;
