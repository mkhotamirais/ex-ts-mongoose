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

export const createOrder = async (req: AuthRequest, res: Response) => {
  // const { userId, selectedProductIds, address, paymentMethod } = req.body;
  const { selectedProductIds } = req.body;
  const userId = req.user?._id;

  try {
    const cart = await Carts.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      res.status(400).json({ message: "Keranjang kosong" });
      return;
    }

    // Filter item yang dipilih
    const selectedItems = cart.items.filter((item) => selectedProductIds.includes(item.productId.toString()));

    if (selectedItems.length === 0) {
      res.status(400).json({ message: "Tidak ada barang yang dipilih" });
      return;
    }

    // Ambil semua product sekaligus
    const productIds = selectedItems.map((item) => item.productId);
    const products = await Products.find({ _id: { $in: productIds } });

    // Buat map untuk cari price dengan cepat
    const productMap = new Map(products.map((product) => [product._id.toString(), product.price]));

    let total = 0;
    for (const item of selectedItems) {
      const product = await Products.findById(item.productId);
      if (!product) {
        res.status(404).json({ message: "Produk tidak ditemukan" });
        return;
      }
      total += product.price * item.qty;
    }

    // Buat order baru
    const order = new Orders({
      userId,
      items: selectedItems.map((item) => ({
        productId: item.productId,
        qty: item.qty,
        price: productMap.get(item.productId.toString()),
      })),
      // address,
      // paymentMethod,
      total,
      status: "pending",
    });

    await order.save();

    // cart.items = cart.items.filter((item) => !selectedProductIds.includes(item.productId.toString()));
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
