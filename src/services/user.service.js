import User from "../models/user.model.js";
import Document from "../models/document.model.js";
import Report from "../models/report.model.js";
import bcrypt from "bcrypt";
import { hashToken, generateSessionId, blacklistToken } from "./token.service.js";
import { sendMail } from "./email.service.js";
import fs from "fs";
import path from "path";

const allowedProfileImageTypes = ["image/jpeg", "image/png", "image/webp"];

const formatUserData = (user) => {
  const userData = user.toObject ? user.toObject() : { ...user };

  delete userData.password;
  delete userData.sessions;
  delete userData.emailVerificationCodeHash;
  delete userData.emailVerificationCodeExpiresAt;

  return userData;
};

const saveProfileImage = (userId, file, existingFilePath = null) => {
  if (!file) {
    return null;
  }

  if (!allowedProfileImageTypes.includes(file.mimetype)) {
    throw new Error("Invalid profile image type. Only JPEG, PNG, and WEBP are allowed.");
  }

  const uploadDir = path.join(process.cwd(), "uploads", "profile-images");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  if (existingFilePath && fs.existsSync(existingFilePath)) {
    fs.unlinkSync(existingFilePath);
  }

  const safeOriginalName = path
    .basename(file.originalname || "profile-image")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${userId}_${Date.now()}_${safeOriginalName}`;
  const filePath = path.join(uploadDir, fileName);

  fs.writeFileSync(filePath, file.buffer);

  return {
    fileName,
    originalName: file.originalname,
    filePath,
    mimeType: file.mimetype,
    size: file.size,
    url: `/uploads/profile-images/${fileName}`,
    uploadedAt: new Date(),
  };
};

export const createUserService = async (data) => {
  const {
    name,
    email,
    password,
    language,
    userIp,
    detectedCountry,
    activity,
    phone,
    company_name,
    gender,
    address,
    city,
    state,
    zip,
    status,
    flag,
    profileImageFile,
  } = data;

  if (!name || !email || !password || !activity || !gender) {
    throw new Error("Required fields are missing check name, email, password, activity and gender and try again");
  }

  if (typeof gender !== "string") {
    throw new Error("Gender must be male, female, or other");
  }

  const normalizedGender = gender.trim().toLowerCase();
  const allowedGenders = ["male", "female", "other"];

  if (!allowedGenders.includes(normalizedGender)) {
    throw new Error("Gender must be male, female, or other");
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new Error("User already exists");
  }

  //  IMPORTANT: Use new + save (ensures pre-save runs)
  const user = new User({
    name: name.trim(),
    email: normalizedEmail,
    password: password.trim(),
    language: language || "en",
    userIp,
    detectedCountry,
    activity: activity.trim(),
    phone: typeof phone === "string" ? phone.trim() : phone,
    company_name: typeof company_name === "string" ? company_name.trim() : company_name,
    gender: normalizedGender,
    address: typeof address === "string" ? address.trim() : address,
    city: typeof city === "string" ? city.trim() : city,
    state: typeof state === "string" ? state.trim() : state,
    zip: typeof zip === "string" ? zip.trim() : zip,
    status: status !== undefined ? status : 1,
    flag: flag !== undefined ? flag : 2,
    sessions: [],
  });

  if (profileImageFile) {
    user.profileImage = saveProfileImage(user._id, profileImageFile);
  }

  await user.save(); // pre-save WILL run here

  return user;
};

export const loginUserService = async (
  email,
  password,
  sessionData = {}
) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const cleanPassword = password.trim();

  // Get user WITH password
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check if user is active
  if (user.status === 0) {
    throw new Error("User account is deactivated");
  }

  // Safety check: ensure password is hashed
  if (!user.password.startsWith("$2b$")) {
    throw new Error("Password is not hashed properly. Re-register user.");
  }

  // Compare password
  const isMatch = await user.comparePassword(cleanPassword);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Create new session
  const sessionId = generateSessionId();
  user.sessions.push({
    sessionId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days for refresh token
    ipAddress: sessionData.ipAddress || null,
    userAgent: sessionData.userAgent || null,
    lastActivityAt: new Date(),
  });

  user.lastLoginAt = new Date();
  await user.save();

  return {
    user,
    sessionId,
    accessTokenExpiry: 3600, // 1 hour
    refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 days
  };
};

export const logoutUserService = async (userId, sessionId = null, logoutAll = false) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (logoutAll) {
    // Logout from all devices - clear all sessions
    user.sessions = [];
  } else if (sessionId) {
    // Logout from specific device
    user.sessions = user.sessions.filter((s) => s.sessionId !== sessionId);
  } else {
    throw new Error("SessionId or logoutAll must be provided");
  }

  user.lastLogoutAt = new Date();
  await user.save();

  return { message: "Logged out successfully" };
};

export const refreshAccessTokenService = async (userId, sessionId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const session = user.sessions.find((s) => s.sessionId === sessionId);

  if (!session) {
    throw new Error("Invalid session");
  }

  // Check if refresh token is expired
  if (new Date() > session.expiresAt) {
    user.sessions = user.sessions.filter((s) => s.sessionId !== sessionId);
    await user.save();
    throw new Error("Refresh token expired. Please login again.");
  }

  // Update last activity
  session.lastActivityAt = new Date();
  await user.save();

  return {
    user,
    sessionId,
    accessTokenExpiry: 3600, // 1 hour
  };
};

export const verifyRefreshTokenService = async (userId, sessionId, token) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const session = user.sessions.find((s) => s.sessionId === sessionId);

  if (!session) {
    throw new Error("Invalid session");
  }

  if (!session.refreshToken || session.refreshToken !== token) {
    throw new Error("Invalid refresh token");
  }

  return user;
};

export const sendCodeToMailService = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new Error("User not found");
  }

  const code = String(123456);
  // const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = await bcrypt.hash(code, 10);

  user.emailVerificationCodeHash = codeHash;
  user.emailVerificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save();

  const subject = "Your verification code";
  const text = `Your verification code is ${code}. It expires in 15 minutes.`;
  const html = `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 15 minutes.</p>`;

  // await sendMail({
  //   to: normalizedEmail,
  //   subject,
  //   text,
  //   html,
  // });

  return {
    message: "Verification code sent to email",
    expiresIn: 15 * 60,
  };
};

export const verifyOtpService = async (email, code) => {
  if (!email || !code) {
    throw new Error("Email and code are required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select("+emailVerificationCodeHash");

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.emailVerificationCodeHash) {
    throw new Error("No verification code found. Please request a new one.");
  }

  if (new Date() > user.emailVerificationCodeExpiresAt) {
    // Clear expired code
    user.emailVerificationCodeHash = undefined;
    user.emailVerificationCodeExpiresAt = undefined;
    await user.save();
    throw new Error("Verification code has expired. Please request a new one.");
  }

  const isValid = await bcrypt.compare(code, user.emailVerificationCodeHash);

  if (!isValid) {
    throw new Error("Invalid verification code");
  }

  // Clear the code after successful verification
  user.emailVerificationCodeHash = undefined;
  user.emailVerificationCodeExpiresAt = undefined;
  await user.save();

  return {
    message: "OTP verified successfully",
    userId: user._id,
  };
};

export const resetPasswordService = async (
  email,
  newPassword,
  confirmPassword
) => {
  if (!email || !newPassword || !confirmPassword) {
    throw new Error("Email, new password and confirm password are required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const cleanPassword = newPassword.trim();
  const cleanConfirmPassword = confirmPassword.trim();

  if (cleanPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  if (cleanPassword !== cleanConfirmPassword) {
    throw new Error("New password and confirm password do not match");
  }

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password"
  );

  if (!user) {
    throw new Error("User not found");
  }

  const isExistingPassword = await user.comparePassword(cleanPassword);

  if (isExistingPassword) {
    throw new Error("New password cannot be the same as the existing password");
  }

  user.password = cleanPassword;
  user.sessions = [];
  await user.save();

  return {
    message: "Password reset successfully. Please login with your new credentials.",
  };
};

export const updateUserService = async (userId, updates) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new Error("User not found");
  }

  if (user.status !== 1) {
    throw new Error("User account is not active");
  }

  const allowedFields = [
    "name",
    "phone",
    "company_name",
    "language",
    "activity",
    "password",
    "gender",
    "address",
    "city",
    "state",
    "zip",
  ];
  const updateData = {};

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      updateData[field] = typeof updates[field] === "string" ? updates[field].trim() : updates[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    if (!updates.profileImageFile) {
      throw new Error("No valid fields provided for update");
    }
  }

  if (updateData.name && updateData.name.length === 0) {
    throw new Error("Name cannot be empty");
  }

  if (updateData.password && updateData.password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  if (updateData.gender) {
    updateData.gender = updateData.gender.toLowerCase();
    const allowedGenders = ["male", "female", "other"];

    if (!allowedGenders.includes(updateData.gender)) {
      throw new Error("Gender must be male, female, or other");
    }
  }

  if (updates.profileImageFile) {
    user.profileImage = saveProfileImage(
      user._id,
      updates.profileImageFile,
      user.profileImage?.filePath
    );
  }

  Object.assign(user, updateData);
  await user.save();

  return user;
};

export const getCreatedUpdatedUserDataService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.status !== 1) {
    throw new Error("User account is not active");
  }

  return formatUserData(user);
};

export const getUserDataService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.status !== 1) {
    throw new Error("User account is not active");
  }

  return {
    user: user,
  };
};

export const addReportService = async (userId, reportData) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const report = new Report({
    userId: user._id,
    ...reportData
  });

  await report.save();

  return report;
};
