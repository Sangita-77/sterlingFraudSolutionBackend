import { Router } from "express";

import { registerUser, loginUser } from "./controllers/user.controller.js";
import {
  getAvailableLanguages,
  getUserLanguage,
  updateUserLanguage,
  detectUserLanguage,
} from "./controllers/language.controller.js";
import { getAddressTokenStats , getAddressTokenAllTxs , getAddressAllTxBounds,getAddressTx } from "./controllers/blockchain.controller.js";
import { authenticateToken, optionalAuth } from "./middlewares/auth.middleware.js";



const router = Router();



// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Language routes
router.get("/languages", getAvailableLanguages);
router.get("/language/detect", detectUserLanguage);
router.get("/language/:userId", authenticateToken, getUserLanguage);
router.put("/language/:userId", authenticateToken, updateUserLanguage);

// Blockchain routes - Protected
router.post("/blockchain/address/token-stats", authenticateToken, getAddressTokenStats);
router.post("/blockchain/address/all-txs", authenticateToken, getAddressTokenAllTxs);
router.post("/blockchain/address/all-tx-bounds", authenticateToken, getAddressAllTxBounds);
router.post("/blockchain/address/tx", authenticateToken , getAddressTx);





export default router;