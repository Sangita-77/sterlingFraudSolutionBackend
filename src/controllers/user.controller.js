import {
  createUserService,
  loginUserService,
  logoutUserService,
  refreshAccessTokenService,
  sendCodeToMailService,
  verifyOtpService,
  getUserDataService,
} from "../services/user.service.js";
import { blacklistToken, hashToken } from "../services/token.service.js";
import User from "../models/user.model.js";
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

    // return console.log("User data to be saved:", userData);

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
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Get session data from request
    const sessionData = {
      ipAddress: req.userIp || req.ip,
      userAgent: req.headers["user-agent"],
    };

    // Service returns user and session info
    const { user, sessionId, accessTokenExpiry, refreshTokenExpiry } =
      await loginUserService(email, password, sessionData);

    // Generate access token (short-lived)
    const accessToken = jwt.sign({ id: user._id, sessionId }, process.env.JWT_SECRET, {
      expiresIn: accessTokenExpiry,
    });

    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign(
      { id: user._id, sessionId, type: "refresh" },
      process.env.JWT_SECRET,
      { expiresIn: refreshTokenExpiry }
    );

    // Store refresh token hash in database
    const userUpdate = await User.findByIdAndUpdate(
      user._id,
      {
        "sessions.$[elem].refreshToken": refreshToken,
        "sessions.$[elem].accessTokenHash": hashToken(accessToken),
      },
      {
        arrayFilters: [{ "elem.sessionId": sessionId }],
        returnDocument: 'after',
      }
    );

    res.json({
      success: true,
      accessToken,
      refreshToken,
      sessionId,
      userLanguage: user.language,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const { sessionId, logoutAll } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Get the token from header for blacklisting
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // Blacklist the access token
    if (token) {
      blacklistToken(token, 3600); // 1 hour
    }

    // Logout from service
    await logoutUserService(userId, sessionId || null, logoutAll || false);

    res.json({
      success: true,
      message: logoutAll
        ? "Logged out from all devices successfully"
        : "Logged out successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken, sessionId } = req.body;
    const userId = req.body.userId || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!refreshToken || !sessionId) {
      return res
        .status(400)
        .json({ message: "Refresh token and sessionId are required" });
    }

    // Verify refresh token
    try {
      jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Get new access token
    const { user, accessTokenExpiry } = await refreshAccessTokenService(
      userId,
      sessionId
    );

    // Generate new access token
    const newAccessToken = jwt.sign(
      { id: user._id, sessionId },
      process.env.JWT_SECRET,
      { expiresIn: accessTokenExpiry }
    );

    res.json({
      success: true,
      accessToken: newAccessToken,
      expiresIn: accessTokenExpiry,
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const getActiveSessions = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const sessions = user.sessions.map((session) => ({
      sessionId: session.sessionId,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      lastActivityAt: session.lastActivityAt,
    }));

    res.json({
      success: true,
      sessions,
      totalSessions: sessions.length,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const sendCodeToMail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const result = await sendCodeToMailService(email);

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const result = await verifyOtpService(email, code);

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserData = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await getUserDataService(userId);

    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
