import { Router } from "express";

import { registerUser, loginUser } from "./controllers/user.controller.js";
import {
  getAvailableLanguages,
  getUserLanguage,
  updateUserLanguage,
  detectUserLanguage,
} from "./controllers/language.controller.js";



const router = Router();



router.post("/register", registerUser);

router.post("/login", loginUser);

// Language routes
router.get("/languages", getAvailableLanguages);
router.get("/language/detect", detectUserLanguage);
router.get("/language/:userId", getUserLanguage);
router.put("/language/:userId", updateUserLanguage);






export default router;