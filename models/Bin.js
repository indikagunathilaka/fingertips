const mongoose = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoose.Schema;

// Create a schema for Bin
const BinSchema = new Schema({
  xAxis: {
    type: String,
    required: [true, "X axis is required"],
    index: true
  },
  yAxis: {
    type: Number,
    required: [true, "Y axis is required"],
    index: true
  },
  section: { type: String, required: [true, "Y axis is required"] },
  code: {
    type: String,
    unique: true,
    required: [true, "Bin code is required"]
  },
  stockItems: [{ type: Schema.Types.ObjectId, ref: "BinStock" }]
});
/* BinSchema.virtual("code").get(() => {
  return `${this.section}${this.xAxis}${this.yAxis}`;
});
BinSchema.set("toObject", { virtuals: true });
BinSchema.set("toJSON", { virtuals: true }); */
BinSchema.plugin(diffHistory);

// Create model for Bin
const Bin = mongoose.model("Bin", BinSchema);

module.exports = Bin;
