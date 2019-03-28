const mongoose = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoose.Schema;

// create schema for measuring type
const MeasuringTypeSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Measuring type name is required"],
      index: true
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

MeasuringTypeSchema.plugin(diffHistory);

// create model for measuring type
const MeasuringType = mongoose.model("MeasuringType", MeasuringTypeSchema);

module.exports = MeasuringType;
