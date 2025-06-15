import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    username: {
      type: String,
      trim: true,
      unique: true,
    },
    DOB: Date,
    password: {
      type: String,
      required: true,
    },
    accessToken: String,
    phone: {
      type: Number,
      trim: true,
    },
    address: String,
    age: Number,
    bio: String,
    profilePhoto: String,
    profilePhotoID: String,
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    userType: {
      type: String,
      enum: ["user", "admin"],
    },
  },
  { timestamps: true }
);

schema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

schema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

schema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", schema);
