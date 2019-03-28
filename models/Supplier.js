const mongoose = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoose.Schema;

// create schema for Supplier
const SupplierSchema = new Schema({
  name: {
    type: String,
    required: [true, "Supplier name is required."],
    index: true
  },
  lane: { type: String, required: [true, "Address lane is required"] },
  city: String,
  state: String,
  country: { type: String, required: [true, "Country is requied"] },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
});

SupplierSchema.plugin(diffHistory);

// create model for Supplier
const Supplier = mongoose.model("Supplier", SupplierSchema);

module.exports = Supplier;
