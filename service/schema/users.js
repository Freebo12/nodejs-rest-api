const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const createHashPassword = async (password) => {
  const result = bcrypt.hash(password, 10);
};

createHashPassword("123456");

const RegExp = /[^\s@]+@[^\s@]+\.[^\s@]+/;

const users = new Schema(
  {
    password: {
      type: String,
      required: [true, "Set password for user"],
    },
    email: {
      type: String,
      match: RegExp,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: {
      type: String,
      default: "",
    },
    avatarURL: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const User = mongoose.model("user", users);

module.exports = User;
