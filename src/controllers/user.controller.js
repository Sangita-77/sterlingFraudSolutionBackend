import { createUserService, loginUserService } from "../services/user.service.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    // Add detected language and IP to user data
    const userData = {
      ...req.body,
      language: req.body.language || req.detectedLanguage,
      userIp: req.userIp,
      detectedCountry: req.geoData?.country,
    };

    const user = await createUserService(userData);

    res.status(201).json({
      success: true,
      data: user,
      detectedLanguage: req.detectedLanguage,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const user = await loginUserService(req.body.email, req.body.password);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      success: true,
      token,
      userLanguage: user.language,
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};