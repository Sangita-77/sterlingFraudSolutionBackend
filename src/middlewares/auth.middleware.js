import jwt from "jsonwebtoken";
import { isTokenBlacklisted } from "../services/token.service.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  // Check if token is blacklisted
  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ message: "Token has been revoked. Please login again." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired. Please refresh your token.",
          code: "TOKEN_EXPIRED"
        });
      }
      return res.status(403).json({ message: "Invalid token" });
    }

    // Prevent using refresh tokens as access tokens
    if (user.type === "refresh") {
      return res.status(403).json({ message: "Invalid token type" });
    }

    req.userId = user.id;
    req.sessionId = user.sessionId;
    req.user = user;
    next();
  });
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    // Check blacklist
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({ message: "Token has been revoked. Please login again." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err && user.type !== "refresh") {
        req.userId = user.id;
        req.sessionId = user.sessionId;
        req.user = user;
      }
    });
  }
  next();
};
