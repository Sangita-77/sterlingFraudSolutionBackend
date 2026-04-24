import Document from "../models/document.model.js";
import User from "../models/user.model.js";
import fs from "fs";
import path from "path";

export const uploadDocumentService = async (userId, documentType, file) => {
  // Validate user exists and is active
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  if (user.status !== 1) {
    throw new Error("User account is not active");
  }

  // Validate file type
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error("Invalid file type. Only PDF, JPEG, PNG, DOC, DOCX are allowed.");
  }

  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), "uploads", "documents");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Generate unique file name
  const fileName = `${userId}_${documentType}_${Date.now()}_${file.originalname}`;
  const filePath = path.join(uploadDir, fileName);

  // Save file to disk
  fs.writeFileSync(filePath, file.buffer);

  // Create document record
  const document = new Document({
    userId,
    documentType,
    fileName,
    filePath,
    mimeType: file.mimetype,
  });

  await document.save();

  return document;
};

export const getUserDocumentsService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const documents = await Document.find({ userId }).sort({ uploadedAt: -1 }).lean();

    return {
        user: user,
        documents: documents,
    };
};