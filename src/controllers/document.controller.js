import {
  uploadDocumentService,
  getUserDocumentsService,
  updateDocumentByIdService,
  uploadCaseDocumentService,
} from "../services/document.service.js";

export const uploadDocument = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId;
    const { documentType } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    // if (!documentType || !["passport", "national_id", "driving_license"].includes(documentType)) {
    //   return res.status(400).json({ message: "Valid document type is required (passport, national_id, driving_license)" });
    // }

    
    const allowedDocumentTypes = [
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

    if (!documentType || !allowedDocumentTypes.includes(documentType)) {
      return res.status(400).json({
        message: "Valid document type is required",
      });
    }

    const document = await uploadDocumentService(userId, documentType, file);

    res.json({ success: true, document });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserDocuments = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId;

    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    const documents = await getUserDocumentsService(userId);
    res.json({ success: true, documents });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateDocumentById = async (req, res) => {
  try {
    const documentId = req.params.id || req.body.id || req.body.documentId;
    const userId = req.body.userId || req.userId;
    const { status, documentType } = req.body;
    const file = req.file;

    if (!documentId) {
      return res.status(400).json({ message: "Document id is required" });
    }

    const updateData = {};
    if (typeof status !== "undefined") updateData.status = Number(status);
    if (documentType) updateData.documentType = documentType;
    if (file) updateData.file = file;

    const updatedDocument = await updateDocumentByIdService(documentId, updateData, userId);
    res.json({ success: true, document: updatedDocument });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const uploadCaseDocument = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId;
    const reportId = req.params.reportId || req.body.reportId;
    const { documentType } = req.body;
    const file = req.file;

    if (!reportId) {
      return res.status(400).json({ message: "Report id is required" });
    }

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    const caseDocument = await uploadCaseDocumentService(
      userId,
      reportId,
      file,
      documentType
    );

    res.json({ success: true, caseDocument });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
