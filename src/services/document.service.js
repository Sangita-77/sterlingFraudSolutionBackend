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
    status: 0, // pending
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

export const updateDocumentByIdService = async (documentId, updateData, userId) => {
  if (!userId) {
    throw new Error("User authentication required");
  }

  const document = await Document.findById(documentId);
  if (!document) {
    throw new Error("Document not found");
  }

  if (document.userId.toString() !== userId.toString()) {
    throw new Error("Unauthorized to update this document");
  }

  if (updateData.documentType) {
    const allowedTypes = ["passport", "national_id", "driving_license"];
    if (!allowedTypes.includes(updateData.documentType)) {
      throw new Error("Invalid document type. Allowed values: passport, national_id, driving_license");
    }
  }

  if (typeof updateData.status !== "undefined") {
    const allowedStatuses = [0, 1, 2];
    if (!allowedStatuses.includes(updateData.status)) {
      throw new Error("Invalid status. Allowed values: 0 (pending), 1 (approved), 2 (rejected)");
    }
  }

  if (updateData.file) {
    const file = updateData.file;
    const allowedFileTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedFileTypes.includes(file.mimetype)) {
      throw new Error("Invalid file type. Only PDF, JPEG, PNG, DOC, DOCX are allowed.");
    }

    const uploadDir = path.join(process.cwd(), "uploads", "documents");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    const fileName = `${document.userId}_${updateData.documentType || document.documentType}_${Date.now()}_${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    updateData.fileName = fileName;
    updateData.filePath = filePath;
    updateData.mimeType = file.mimetype;
    updateData.uploadedAt = new Date();
    delete updateData.file;
  }

  Object.assign(document, updateData);
  await document.save();

  return document;
};