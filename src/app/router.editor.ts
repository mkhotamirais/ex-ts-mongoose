import express from "express";
import { createProductcat, deleteProductcat, updateProductcat } from "./product/productcat.controller";
import { createProducttag, deleteProducttag, updateProducttag } from "./product/producttag.controller";
import { createProduct, deleteProduct, updateProduct } from "./product/product.controller";
import { createPostcat, deletePostcat, updatePostcat } from "./post/postcat.controller";
import { createPost, deletePost, updatePost } from "./post/post.controller";
import upload from "../helpers/multer";

const router = express.Router();

router.post("/product", upload, createProduct);
router.post("/productcat", createProductcat);
router.post("/producttag", createProducttag);
router.post("/post", upload, createPost);
router.post("/postcat", createPostcat);

router.route("/product/:id").patch(upload, updateProduct).delete(deleteProduct);
router.route("/productcat/:id").patch(updateProductcat).delete(deleteProductcat);
router.route("/producttag/:id").patch(updateProducttag).delete(deleteProducttag);
router.route("/post/:id").patch(upload, updatePost).delete(deletePost);
router.route("/postcat/:id").patch(updatePostcat).delete(deletePostcat);

export default router;
