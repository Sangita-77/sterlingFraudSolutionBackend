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
  updateUser,
  addReport,
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
const upload = multer({ storage: multer.memoryStorage() });



// Public routes
router.post("/register", upload.any(), registerUser);
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

router.put("/update-user", authenticateToken, upload.any(), updateUser);
router.post("/get-user-data", authenticateToken, getUserData);
router.post("/upload-document", authenticateToken, upload.single("file"), uploadDocument);
router.post("/get-documents", authenticateToken, getUserDocuments);
router.put("/documents/:id", authenticateToken, upload.single("file"), updateDocumentById);
router.post("/update-documents", authenticateToken, upload.single("file"), updateDocumentById);
router.post("/reports/supporting-documents", authenticateToken , upload.single("file"), uploadCaseDocument);

router.post("/add-report", addReport);

export default router;
