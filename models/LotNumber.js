const mongoose = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoose.Schema;

// Create a schema for LotNumber
const LotNumberSchema = new Schema(
  {
    lotNumber: {
      type: String,
      required: [true, "LOT Number is required"]
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

LotNumberSchema.plugin(diffHistory);

// Create model for LotNumber
const LotNumber = mongoose.model("LotNumber", LotNumberSchema);

module.exports = LotNumber;
