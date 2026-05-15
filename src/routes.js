import { Router } from "express";
import multer from "multer";

import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getActiveSessions,
  sendCodeToMail,
  verifyOtp,
  resetPassword,
  getUserData,
  getCreatedUpdatedUserData,
  updateUser,
  addReport,
  getAllUserData,
  searchUsers,
  deleteUsers,
} from "./controllers/user.controller.js";
import { 
  uploadDocument, 
  getUserDocuments,
  updateDocumentById,
  uploadCaseDocument,
} from "./controllers/document.controller.js";
import {
  getAvailableLanguages,
  getUserLanguage,
  updateUserLanguage,
  detectUserLanguage,
} from "./controllers/language.controller.js";
import {
  getAddressTokenStats,
  getAddressTokenAllTxs,
  getAddressAllTxBounds,
  getAddressTx,
  getBitAddressOwnerDetails,
} from "./controllers/blockchain.controller.js";
import { authenticateToken, optionalAuth } from "./middlewares/auth.middleware.js";


 
const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const handleSingleFileUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "File is too large. Maximum allowed size is 10MB"
          : error.message;

      return res.status(status).json({ message });
    }

    return res.status(400).json({ message: error.message });
  });
};

const handleAnyFileUpload = (req, res, next) => {
  upload.any()(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "File is too large. Maximum allowed size is 10MB"
          : error.message;

      return res.status(status).json({ message });
    }

    return res.status(400).json({ message: error.message });
  });
};



// Public routes
router.post("/register", handleAnyFileUpload, registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/send-code", sendCodeToMail);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// Protected routes
router.post("/logout", authenticateToken, logoutUser);
router.get("/sessions", authenticateToken, getActiveSessions);

// Language routes
router.get("/languages", getAvailableLanguages);
router.get("/language/detect", detectUserLanguage);
router.get("/language/:userId", authenticateToken, getUserLanguage);
router.put("/language/:userId", authenticateToken, updateUserLanguage);

// Blockchain routes - Protected
router.post("/blockchain/address/token-stats", getAddressTokenStats);
router.post("/blockchain/address/all-txs", getAddressTokenAllTxs);
router.post("/blockchain/address/all-tx-bounds", getAddressAllTxBounds);
router.post("/blockchain/address/tx" , getAddressTx);
router.post("/blockchain/address/owner-details", authenticateToken , getBitAddressOwnerDetails);

router.put("/update-user", authenticateToken, handleAnyFileUpload, updateUser);
router.get("/user-data", authenticateToken, getCreatedUpdatedUserData);
router.post("/get-user-data", authenticateToken, getUserData);
router.post("/upload-document", authenticateToken, handleSingleFileUpload("file"), uploadDocument);
router.post("/get-documents", authenticateToken, getUserDocuments);
router.put("/documents/:id", authenticateToken, handleSingleFileUpload("file"), updateDocumentById);
router.post("/update-documents", authenticateToken, handleSingleFileUpload("file"), updateDocumentById);
router.post("/reports/supporting-documents", authenticateToken , handleSingleFileUpload("file"), uploadCaseDocument);

router.post("/add-report", addReport);

router.post("/get-all-users", authenticateToken, getAllUserData);
router.post("/search-users", authenticateToken, searchUsers);
router.delete("/delete-users", authenticateToken , deleteUsers);

export default router;
