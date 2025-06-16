import express from "express";
import { clearCart, createCart, deleteCartItem, deleteSelectedCartItems, getCarts } from "./product/cart.controller";
import { createOrder, getOrders } from "./product/order.controller";
import { createAddress, deleteAddress, getAddressById, getAddresses, updateAddress } from "./auth/address.controller";

const router = express.Router();

router.route("/cart").get(getCarts).post(createCart).delete(clearCart);
router.delete("/cart/:itemId", deleteCartItem);
router.post("/cart/delete-selected", deleteSelectedCartItems);
router.route("/orders").get(getOrders).post(createOrder);

router.route("/account/address").get(getAddresses).post(createAddress);
router.route("/account/address/:id").get(getAddressById).patch(updateAddress).delete(deleteAddress);

export default router;
