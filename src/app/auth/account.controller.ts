import { AuthRequest } from "../../helpers/types";
import { Users } from "./auth.model";
import { Response } from "express";
import bcrypt from "bcrypt";
import validator from "validator";
import { Carts, Orders } from "../product/product.model";
import { errMsg } from "../../helpers/functions";

export const getAccount = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(404).json({ error: `user not found` });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};

export const updateAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = await Users.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }

    const { name, phone, email } = req.body;
    let errors: Record<string, string | null> | null = {
      name: null,
      email: null,
      password: null,
      confirmPassword: null,
    };
    let status = 400;

    if (!name || name === "") errors = { ...errors, name: "Name is required!" };
    const duplicateName = await Users.findOne({ name });
    if (duplicateName && duplicateName.name !== name) {
      errors = { ...errors, name: "Duplicate name!" };
      status = 409;
    }
    if (!email || email === "") errors = { ...errors, email: "Email is required!" };
    const duplicateEmail = await Users.findOne({ email });
    if (duplicateEmail && duplicateEmail.email !== email) {
      errors = { ...errors, email: "Duplicate email!" };
      status = 409;
    }
    if (!validator.isEmail(email)) errors = { ...errors, email: "Wrong email format!" };
    if (phone && !validator.isMobilePhone(phone, "id-ID"))
      errors = { ...errors, phone: "Invalid phone number format!" };

    const hasError = Object.values(errors).some((value) => value !== null);
    if (hasError) {
      res.status(status).json({ errors });
      return;
    }

    user.name = name;
    user.email = email;
    user.phone = phone;

    await user.save();

    res.status(200).json({ message: "Profil berhasil diperbarui", user });
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui profil", error });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { password } = req.body;
    let errors: Record<string, string | null> | null = { password: null };

    const userId = req.user?._id;

    const user = await Users.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }

    if (!password || password === "") {
      errors = { password: "Password harus diisi!" };
      res.status(400).json({ errors });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      errors = { password: "Password salah!" };
      res.status(400).json({ errors });
      return;
    }

    await Users.findByIdAndDelete(userId);
    await Carts.deleteOne({ userId });
    await Orders.deleteMany({ userId });

    res.status(200).json({ message: "Akun berhasil dihapus" });
  } catch (error) {
    errMsg(error, res);
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    let errors: Record<string, string | null> | null = {
      currentPassword: null,
      newPassword: null,
      confirmPassword: null,
    };

    const user = await Users.findById(userId);
    if (!user || !user.password) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }

    if (!currentPassword || currentPassword === "")
      errors = { ...errors, currentPassword: "Password lama harus diisi!" };
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) errors = { ...errors, currentPassword: "Password lama salah!" };
    if (!newPassword || newPassword === "") errors = { ...errors, newPassword: "Password baru harus diisi!" };
    if (!confirmPassword || confirmPassword === "")
      errors = { ...errors, confirmPassword: "Konfirmasi password harus diisi!" };
    if (newPassword !== confirmPassword)
      errors = { ...errors, confirmPassword: "Password dan konfirmasi password tidak cocok!" };

    const hasError = Object.values(errors).some((value) => value !== null);
    if (hasError) {
      res.status(400).json({ errors });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password berhasil diubah" });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengubah password", error });
  }
};
