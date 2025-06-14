import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  label: { type: String }, // opsional, misal "Rumah", "Kantor"
  isDefault: { type: Boolean, default: false },

  province: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  postalCode: { type: String, required: true },
  fullAddress: { type: String, required: true },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    accessToken: [String],

    addresses: [addressSchema],
  },
  { timestamps: true }
);

export const Users = mongoose.model("users", userSchema);
