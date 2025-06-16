import { Request, Response } from "express";
import { Carts } from "./product.model";
import { errMsg } from "../../helpers/functions";
import { AuthRequest } from "helpers/types";
import mongoose from "mongoose";

export const getCarts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const cart = await Carts.findOne({ userId }).populate({ path: "items.productId" });
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }
    res.status(200).json(cart);
  } catch (err) {
    errMsg(err, res);
  }
};

export const createCart = async (req: AuthRequest, res: Response) => {
  const { productId, qty } = req.body;

  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    let cart = await Carts.findOne({ userId });

    if (!cart) {
      cart = new Carts({ userId, items: [{ productId, qty }] });
    } else {
      const itemIndex = cart.items.findIndex((item) => item.productId.equals(productId));

      if (itemIndex > -1) {
        // cart.items[itemIndex].qty += qty;
        if (qty === 1 || qty === -1) {
          // Tambah atau kurang qty
          cart.items[itemIndex].qty += qty;
        } else {
          // Input langsung: ganti qty sesuai input
          cart.items[itemIndex].qty = qty;
        }
      } else {
        cart.items.push({ productId, qty });
      }
    }

    await cart.save();
    const data = await Carts.findOne({ userId }).populate({ path: "items.productId" });
    res.status(200).json(data);
  } catch (err) {
    errMsg(err, res);
  }
};

export const deleteCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { itemId } = req.params;

    const cart = await Carts.findOne({ userId });
    if (!cart) {
      res.status(404).json({ message: "Cart tidak ditemukan" });
      return;
    }

    cart.items.pull({ _id: itemId });
    await cart.save();

    const data = await Carts.findOne({ userId }).populate({ path: "items.productId" });
    res.status(200).json(data);
  } catch (error) {
    errMsg(error, res);
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    const cart = await Carts.findOne({ userId });
    if (!cart) {
      res.status(404).json({ message: "Cart tidak ditemukan" });
      return;
    }

    cart.items.splice(0, cart.items.length); // atau gunakan cart.items = []
    await cart.save();

    res.status(200).json({ message: "Seluruh isi cart berhasil dihapus" });
  } catch (error) {
    errMsg(error, res);
  }
};

export const deleteSelectedCartItems = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { itemIds } = req.body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      res.status(400).json({ message: "Item yang ingin dihapus tidak ditemukan" });
      return;
    }

    const cart = await Carts.findOne({ userId });
    if (!cart) {
      res.status(404).json({ message: "Cart tidak ditemukan" });
      return;
    }

    itemIds.forEach((itemId) => {
      cart.items.pull({ _id: itemId });
    });

    // debug
    // console.log(
    //   "Items in cart:",
    //   cart.items.map((i) => i._id.toString())
    // );
    // console.log("Items to delete:", itemIds);
    await cart.save();

    res.status(200).json({ message: "Item terpilih berhasil dihapus" });
  } catch (error) {
    errMsg(error, res);
  }
};
