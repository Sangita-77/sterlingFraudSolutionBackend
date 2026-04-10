import { createUserService, loginUserService } from "../services/user.service.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const user = await createUserService(req.body);

    res.status(201).json({
      success: true,
      data: user,
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
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};