import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  label: { type: String, default: "Rumah" },
  isDefault: { type: Boolean, default: false },

  provinceId: { type: String, required: true },
  regencyId: { type: String, required: true },
  districtId: { type: String, required: true },
  villageId: { type: String, required: true },

  province: { type: String, required: true },
  regency: { type: String, required: true },
  district: { type: String, required: true },
  village: { type: String, required: true },

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
