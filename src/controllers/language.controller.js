import User from "../models/user.model.js";
import {
  getSupportedLanguages,
  isValidLanguage,
  detectLanguageByIP,
  getPublicIP,
} from "../services/language.service.js";

export const getAvailableLanguages = (req, res) => {
  try {
    const languages = getSupportedLanguages();
    res.json({
      success: true,
      languages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching languages",
      error: error.message,
    });
  }
};

export const getUserLanguage = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("language email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      language: user.language,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user language",
      error: error.message,
    });
  }
};

export const updateUserLanguage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { language } = req.body;

    // Validate language
    if (!language || !isValidLanguage(language)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language. Supported languages: en, fr, de, it",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { language },
      { new: true }
    ).select("language email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Language updated successfully",
      language: user.language,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating language",
      error: error.message,
    });
  }
};

export const detectUserLanguage = async (req, res) => {
  try {
    let userIp = req.userIp;
    const testIp = req.query.testIp;

    // If testIp provided, use it directly (for testing)
    if (testIp) {
      const geoData = detectLanguageByIP(testIp);
      return res.json({
        success: true,
        detectedLanguage: geoData.language,
        userIp: testIp,
        geoData,
        note: "Testing with custom IP",
      });
    }

    // If localhost/IPv6 loopback, fetch the actual public IP
    const isLocalhost = userIp === "::1" || userIp === "127.0.0.1" || userIp.startsWith("127.");
    if (isLocalhost) {
      const publicIp = await getPublicIP();
      if (publicIp) {
        userIp = publicIp;
      }
    }

    const geoData = detectLanguageByIP(userIp);

    res.json({
      success: true,
      detectedLanguage: geoData.language,
      userIp,
      geoData,
      isLocalhost: isLocalhost && userIp !== "::1" ? "Public IP fetched" : undefined,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error detecting language",
      error: error.message,
    });
  }
};
