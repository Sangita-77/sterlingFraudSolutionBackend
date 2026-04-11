import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    enum: ["en", "fr", "de", "it"],
    default: "en",
  },
  userIp: String,
  detectedCountry: String,
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);