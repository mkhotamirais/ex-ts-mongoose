import { AuthRequest } from "../../helpers/types";
import { Users } from "./auth.model";
import { Response } from "express";

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = await Users.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }
    const data = user.addresses;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil alamat", error });
  }
};

export const getAddressById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = await Users.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }

    const addressId = req.params.id;
    const address = user.addresses.find((address) => address._id.toString() === addressId);
    if (!address) {
      res.status(404).json({ message: "Alamat tidak ditemukan" });
      return;
    }
    res.status(200).json(address);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil alamat", error });
  }
};

export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const user = await Users.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }

    const { label, provinceId, regencyId, districtId, villageId, fullAddress, postalCode } = req.body;
    let errors: Record<string, string | null> | null = {
      label: null,
      provinceId: null,
      regencyId: null,
      districtId: null,
      villageId: null,
      fullAddress: null,
      postalCode: null,
    };

    if (!label || label === "") errors = { ...errors, label: "Label is required!" };
    if (!provinceId || provinceId === "") errors = { ...errors, provinceId: "Province is required!" };
    if (!regencyId || regencyId === "") errors = { ...errors, regencyId: "Regency is required!" };
    if (!districtId || districtId === "") errors = { ...errors, districtId: "District is required!" };
    if (!villageId || villageId === "") errors = { ...errors, villageId: "Village is required!" };
    if (!fullAddress || fullAddress === "") errors = { ...errors, fullAddress: "Full Address is required!" };
    if (!postalCode || postalCode === "") errors = { ...errors, postalCode: "Postal Code is required!" };

    if (Object.values(errors).some((error) => error !== null)) {
      res.status(400).json({ errors });
      return;
    }

    if (req.body.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push(req.body);
    await user.save();

    res.status(201).json({ message: "Alamat berhasil ditambahkan", addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: "Gagal menambah alamat", error });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const addressId = req.params.id;
    const user = await Users.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }

    const { label, provinceId, regencyId, districtId, villageId, fullAddress, postalCode, isDefault } = req.body;

    let errors: Record<string, string | null> = {
      label: null,
      provinceId: null,
      regencyId: null,
      districtId: null,
      villageId: null,
      fullAddress: null,
      postalCode: null,
    };

    if (!label || label === "") errors.label = "Label is required!";
    if (!provinceId || provinceId === "") errors.provinceId = "Province is required!";
    if (!regencyId || regencyId === "") errors.regencyId = "Regency is required!";
    if (!districtId || districtId === "") errors.districtId = "District is required!";
    if (!villageId || villageId === "") errors.villageId = "Village is required!";
    if (!fullAddress || fullAddress === "") errors.fullAddress = "Full Address is required!";
    if (!postalCode || postalCode === "") errors.postalCode = "Postal Code is required!";

    if (Object.values(errors).some((error) => error !== null)) {
      res.status(400).json({ errors });
      return;
    }

    // Temukan alamat yang akan diupdate
    const address = user.addresses.id(addressId);
    if (!address) {
      res.status(404).json({ message: "Alamat tidak ditemukan" });
      return;
    }

    // Jika akan dijadikan default, reset yang lain
    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    // Update nilai
    address.label = label;
    address.provinceId = provinceId;
    address.regencyId = regencyId;
    address.districtId = districtId;
    address.villageId = villageId;
    address.fullAddress = fullAddress;
    address.postalCode = postalCode;
    address.isDefault = isDefault;

    await user.save();

    res.status(200).json({ message: "Alamat berhasil diperbarui", address });
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui alamat", error });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const user = await Users.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }

    const address = user.addresses.id(id);
    if (!address) {
      res.status(404).json({ message: "Alamat tidak ditemukan" });
      return;
    }

    address.deleteOne(); // hapus dari array
    await user.save();

    res.status(200).json({ message: "Alamat berhasil dihapus", addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus alamat", error });
  }
};
