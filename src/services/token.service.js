import crypto from "crypto";

// In-memory token blacklist (can be upgraded to Redis)
const tokenBlacklist = new Set();
const tokenExpiryMap = new Map();

/**
 * Add token to blacklist
 * @param {string} token - The token to blacklist
 * @param {number} expiresIn - Time in seconds until token expires
 */
export const blacklistToken = (token, expiresIn = 3600) => {
  const tokenHash = hashToken(token);
  tokenBlacklist.add(tokenHash);

  // Auto-remove from blacklist after expiration
  const expiryTime = Date.now() + expiresIn * 1000;
  tokenExpiryMap.set(tokenHash, expiryTime);

  setTimeout(() => {
    tokenBlacklist.delete(tokenHash);
    tokenExpiryMap.delete(tokenHash);
  }, expiresIn * 1000);
};

/**
 * Check if token is blacklisted
 * @param {string} token - The token to check
 * @returns {boolean} True if token is blacklisted
 */
export const isTokenBlacklisted = (token) => {
  const tokenHash = hashToken(token);
  return tokenBlacklist.has(tokenHash);
};

/**
 * Hash token for storage
 * @param {string} token - Token to hash
 * @returns {string} Hashed token
 */
export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Generate session ID
 * @returns {string} Session ID
 */
export const generateSessionId = () => {
  return crypto.randomBytes(16).toString("hex");
};

/**
 * Clear all expired blacklist entries
 */
export const clearExpiredBlacklist = () => {
  const now = Date.now();
  for (const [hash, expiryTime] of tokenExpiryMap.entries()) {
    if (expiryTime < now) {
      tokenBlacklist.delete(hash);
      tokenExpiryMap.delete(hash);
    }
  }
};

// Run cleanup every hour
setInterval(clearExpiredBlacklist, 3600000);