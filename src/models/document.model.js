import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentType: {
      type: String,
      enum: [
        "passport_front",
        "passport_back",
        "passport_selfie",

        "national_id_front",
        "national_id_back",
        "national_id_selfie",

        "driving_license_front",
        "driving_license_back",
        "driving_license_selfie",
      ],
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      default: 0, // 1 = approve, 0 = pending, 2 = reject
      enum: [0, 1, 2],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);