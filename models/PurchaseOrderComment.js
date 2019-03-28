const mongoose = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoose.Schema;

// create schema for comment
const PurchaseOrderCommentSchema = new Schema({
  comment: String,
  date: { type: Date, default: Date.now },
  operation: String,
  purchaseOrder: [{ type: Schema.Types.ObjectId, ref: "PurchaseOrder" }],
  createdBy: { type: Schema.Types.ObjectId, ref: "User" }
});

PurchaseOrderCommentSchema.plugin(diffHistory);

// create model for purchase order comment
const PurchaseOrderComment = mongoose.model(
  "PurchaseOrderComment",
  PurchaseOrderCommentSchema
);

module.exports = PurchaseOrderComment;
