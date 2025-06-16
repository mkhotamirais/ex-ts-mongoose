import { Response } from "express";
import { Carts, Orders, Products } from "./product.model";
import { AuthRequest } from "helpers/types";
import { errMsg } from "../../helpers/functions";

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Orders.find({ userId: req.user?._id }).populate({ path: "items.productId" });
    res.status(200).json(orders);
  } catch (error) {
    errMsg(error, res);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const order = await Orders.findById(id).populate({ path: "items.productId" });
    res.status(200).json(order);
  } catch (error) {
    errMsg(error, res);
  }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  const { selectedProductIds, address } = req.body;
  const userId = req.user?._id;

  try {
    if (!address || !address.fullAddress) {
      res.status(400).json({ message: "Alamat pengiriman diperlukan" });
      return;
    }

    const cart = await Carts.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      res.status(400).json({ message: "Keranjang kosong" });
      return;
    }

    const selectedItems = cart.items.filter((item) => selectedProductIds.includes(item.productId.toString()));

    if (selectedItems.length === 0) {
      res.status(400).json({ message: "Tidak ada barang yang dipilih" });
      return;
    }

    const productIds = selectedItems.map((item) => item.productId);
    const products = await Products.find({ _id: { $in: productIds } });

    // Buat map untuk cari price dengan cepat
    const productMap = new Map(products.map((product) => [product._id.toString(), product.price]));

    let total = 0;
    const items = selectedItems.map((item) => {
      const price = productMap.get(item.productId.toString()) ?? 0;
      total += price * item.qty;
      return { productId: item.productId, qty: item.qty, price };
    });

    const order = new Orders({
      userId,
      items,
      address,
      // paymentMethod,
      total,
      status: "pending",
    });

    await order.save();

    cart.set(
      "items",
      cart.items.filter((item) => !selectedProductIds.includes(item.productId.toString()))
    );
    await cart.save();

    res.status(201).json({ message: "Checkout berhasil", order });
  } catch (err) {
    errMsg(err, res);
  }
};
