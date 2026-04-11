import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";

export const createUserService = async (data) => {
  const { name, email, password, language, userIp, detectedCountry } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    language: language || "en",
    userIp,
    detectedCountry,
  });

  return user;
};

export const loginUserService = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new Error("Invalid credentials");

  return user;
};