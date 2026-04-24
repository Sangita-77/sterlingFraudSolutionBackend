import { uploadDocumentService, getUserDocumentsService } from "../services/document.service.js";

export const uploadDocument = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId;
    const { documentType } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    if (!documentType || !["passport", "national_id", "driving_license"].includes(documentType)) {
      return res.status(400).json({ message: "Valid document type is required (passport, national_id, driving_license)" });
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