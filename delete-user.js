import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Import User model
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
    });

    const User = mongoose.model("User", userSchema);

    // Delete the user
    const result = await User.deleteOne({ email: "sangita@gmail.com" });
    console.log("Delete result:", result);

    await mongoose.connection.close();
    console.log("User deleted successfully!");
  } catch (error) {
    console.error("Error:", error.message);
  }
};

connectDB();
