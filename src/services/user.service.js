import User from "../models/user.model.js";
import bcrypt from "bcrypt";

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
    status,
    flag,
  } = data;

  if (!name || !email || !password || !activity) {
    throw new Error("Required fields are missing");
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // 👇 IMPORTANT: Use new + save (ensures pre-save runs)
  const user = new User({
    name: name.trim(),
    email: normalizedEmail,
    password: password.trim(),
    language: language || "en",
    userIp,
    detectedCountry,
    activity: activity.trim(),
    phone,
    company_name,
    status: status !== undefined ? status : 1,
    flag: flag !== undefined ? flag : 2,
  });

  await user.save(); // 🔥 pre-save WILL run here

  return user;
};

export const loginUserService = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const cleanPassword = password.trim();

  console.log("Login attempt - Email:", normalizedEmail);

  // Get user WITH password
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Safety check: ensure password is hashed
  if (!user.password.startsWith("$2b$")) {
    throw new Error("Password is not hashed properly. Re-register user.");
  }

  // Compare password using schema method
  const isMatch = await user.comparePassword(cleanPassword);

  console.log("Password match result:", isMatch);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  return user;
};