import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    userData: {
      name: String,
      email: String,
      password: String,
      DOB: Date,
      userType: String,
    },
    expiresAt: {
      type: Date,
      default: Date.now,
      expires: 300, // 5 minutes in seconds
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5, // Maximum 5 attempts
    },
  },
  { timestamps: true }
);

// Index to automatically delete expired documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP = mongoose.model("OTP", otpSchema);