import express from "express";
import { getUsers } from "./userController.js";
import { deleteProduct, getProductById, getProducts, postProduct, updateProduct } from "./productController.js";
import { signin, signup } from "./authController.js";
const router = express.Router();

// user
router.route("/user").get(getUsers);

// product
router.route("/product").get(getProducts).post(postProduct);
router.route("/product/:id").get(getProductById).patch(updateProduct).delete(deleteProduct);

// auth
router.post("/signup", signup);
router.post("/signin", signin);

export default router;
