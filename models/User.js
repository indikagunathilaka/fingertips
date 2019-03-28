const mongoose = require("mongoose");
const diffHistory = require("mongoose-diff-history/diffHistory").plugin;
const Schema = mongoose.Schema;

// Create a schema for User
const UserSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    index: true
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    index: true
  },
  email: {
    type: String,
    required: [true, "Email address is required"],
    index: true
  },
  password: { type: String, required: [true, "Password is required"] },
  roles: [{ type: Schema.Types.ObjectId, require: true, ref: "Role" }],
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
});

UserSchema.plugin(diffHistory);

// Create model for User
const User = mongoose.model("User", UserSchema);

module.exports = User;
