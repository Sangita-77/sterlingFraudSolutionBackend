import Document from "../models/document.model.js";
import CaseDocument from "../models/caseDocument.model.js";
import Report from "../models/report.model.js";
import User from "../models/user.model.js";
import { getUserWithStatusesService } from "./user.service.js";
import {
  notifyCustomerKycStatusService,
  notifySuperAdminsService,
} from "./notification.service.js";
import fs from "fs";
import path from "path";

const allowedDocumentFileTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

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
  if (!allowedDocumentFileTypes.includes(file.mimetype)) {
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

  await notifySuperAdminsService({
    actorId: user._id,
    action: "kyc_uploaded",
    title: "New KYC uploaded",
    message: `${user.name} uploaded ${documentType} for KYC verification.`,
    entityType: "document",
    entityId: document._id,
    metadata: {
      customerId: user._id,
      customerName: user.name,
      customerEmail: user.email,
      documentType,
      status: document.status,
    },
  });

  return document;
};

export const getUserDocumentsService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const documents = await Document.find({ userId }).sort({ uploadedAt: -1 }).lean();

    return {
        user: await getUserWithStatusesService(user),
        documents: documents,
    };
};

export const updateDocumentByIdService = async (
  documentId,
  updateData,
  targetUserId,
  actorUserId
) => {
  if (!actorUserId) {
    throw new Error("User authentication required");
  }

  const actor = await User.findById(actorUserId);
  if (!actor) {
    throw new Error("Authenticated user not found");
  }

  const document = await Document.findById(documentId);
  if (!document) {
    throw new Error("Document not found");
  }

  const isSuperAdmin = actor.flag === 0;
  const isOwner = document.userId.toString() === actorUserId.toString();
  const requestedUserMatchesDocument =
    !targetUserId || document.userId.toString() === targetUserId.toString();

  if (!requestedUserMatchesDocument) {
    throw new Error("Unauthorized to update this document");
  }

  if (!isSuperAdmin && !isOwner) {
    throw new Error("Unauthorized to update this document");
  }

  if (typeof updateData.status !== "undefined" && !isSuperAdmin) {
    throw new Error("Only super admin can update KYC status");
  }

  if ((updateData.file || updateData.documentType) && !isOwner && !isSuperAdmin) {
    throw new Error("Unauthorized to update this document");
  }

  const previousStatus = document.status;
  const hadFileUpdate = Boolean(updateData.file);

  if (updateData.documentType) {
    // const allowedTypes = ["passport", "national_id", "driving_license"];
    const allowedTypes = [
      "passport_front",
      "passport_back",
      "passport_selfie",

      "national_id_front",
      "national_id_back",
      "national_id_selfie",

      "driving_license_front",
      "driving_license_back",
      "driving_license_selfie",
    ];
    if (!allowedTypes.includes(updateData.documentType)) {
      throw new Error("Invalid document type. Allowed values: passport, national_id, driving_license {_front, _back, _selfie}");
    }
  }

  if (typeof updateData.status !== "undefined") {
    const allowedStatuses = [0, 1, 2];
    if (!allowedStatuses.includes(updateData.status)) {
      throw new Error("Invalid status. Allowed values: 0 (pending), 1 (approved), 2 (rejected)");
    }
  }

  if (updateData.file) {
    updateData.status = 0;
    const file = updateData.file;
    if (!allowedDocumentFileTypes.includes(file.mimetype)) {
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

  if (hadFileUpdate) {
    const customer = isOwner ? actor : await User.findById(document.userId);

    await notifySuperAdminsService({
      actorId: actor._id,
      action: "kyc_uploaded",
      title: "KYC document updated",
      message: `${customer?.name || "Customer"} updated ${document.documentType} for KYC verification.`,
      entityType: "document",
      entityId: document._id,
      metadata: {
        customerId: document.userId,
        customerName: customer?.name,
        customerEmail: customer?.email,
        documentType: document.documentType,
        status: document.status,
      },
    });
  }

  if (
    typeof updateData.status !== "undefined" &&
    previousStatus !== document.status
  ) {
    await notifyCustomerKycStatusService({
      customerId: document.userId,
      actorId: actor._id,
      document,
      previousStatus,
    });
  }

  return document;
};

export const uploadCaseDocumentService = async (
  userId,
  reportId,
  file,
  documentType = "supporting_document"
) => {
  if (!userId) {
    throw new Error("User authentication required");
  }

  if (!reportId) {
    throw new Error("Report id is required");
  }

  if (!file) {
    throw new Error("File is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.status !== 1) {
    throw new Error("User account is not active");
  }

  const report = await Report.findById(reportId);
  if (!report) {
    throw new Error("Report not found");
  }

  if (report.userId.toString() !== userId.toString()) {
    throw new Error("Unauthorized to upload documents for this report");
  }

  if (!allowedDocumentFileTypes.includes(file.mimetype)) {
    throw new Error("Invalid file type. Only PDF, JPEG, PNG, DOC, DOCX are allowed.");
  }

  const uploadDir = path.join(process.cwd(), "uploads", "case-documents");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const cleanDocumentType =
    typeof documentType === "string" && documentType.trim()
      ? documentType.trim()
      : "supporting_document";
  const fileName = `${reportId}_${userId}_${cleanDocumentType}_${Date.now()}_${file.originalname}`;
  const filePath = path.join(uploadDir, fileName);

  fs.writeFileSync(filePath, file.buffer);

  const caseDocument = new CaseDocument({
    reportId,
    userId,
    documentType: cleanDocumentType,
    fileName,
    originalName: file.originalname,
    filePath,
    mimeType: file.mimetype,
    status: 0,
  });

  await caseDocument.save();

  if (report.status !== 4) {
    report.status = 4;
    await report.save();
  }

  return caseDocument;
};
