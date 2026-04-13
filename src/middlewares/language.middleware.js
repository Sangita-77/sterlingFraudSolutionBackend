import { detectLanguageByIP } from "../services/language.service.js";

export const languageDetectionMiddleware = (req, res, next) => {
  try {
    // Get client IP from various sources
    const userIp =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.headers["x-real-ip"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    // Remove IPv6 prefix if present
    const cleanIp = userIp.replace(/^::ffff:/, "");

    // Detect language based on IP
    const geoData = detectLanguageByIP(cleanIp);

    // Attach to request for later use
    req.userIp = cleanIp;
    req.detectedLanguage = geoData.language;
    req.geoData = geoData;

    next();
  } catch (error) {
    console.error("Language detection middleware error:", error);
    req.detectedLanguage = "en"; // Default fallback
    next();
  }
};
