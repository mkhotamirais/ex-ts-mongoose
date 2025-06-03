import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, requried: true, unique: true },
    password: { type: String, requried: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    accessToken: [String],
  },
  {
    timestamps: true,
  }
);

export const Users = mongoose.model("users", userSchema);
