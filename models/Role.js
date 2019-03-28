const mongoose = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoose.Schema;

// Create a schema for Role
const RoleSchema = new Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
});

RoleSchema.plugin(diffHistory);

// Create model for Role
const Role = mongoose.model("Role", RoleSchema);

module.exports = Role;
