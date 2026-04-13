import User from "../models/user.model.js";
import bcrypt from "bcrypt";

export const createUserService = async (data) => {

  // console.log("Request body:", data);

  const { name, email, password, language, userIp, detectedCountry,activity,phone,company_name,status,flag } = data;
  // const { name, email, password, language, userIp, detectedCountry,activity,country,phone,company_name,status,flag } = data;

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
    activity,
    phone,
    company_name,
    status: status !== undefined ? status : 1, // Default to active if not provided
    flag: flag !== undefined ? flag : 2, // Default to user role if not provided
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