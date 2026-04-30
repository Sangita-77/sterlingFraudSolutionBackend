import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bitcoinAddress: {
      type: String,
      required: true,
    },
    proposedOwnerType: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    email_received: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Number,
      default: 0, // 0 = pending , 3 = detected , 1 = approved / 2 = reject , 4 = document_submitted , 5 = under_review , 6 = analysis , 7 = resulation 
      enum: [0, 1, 2, 3, 4, 5, 6, 7],
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);