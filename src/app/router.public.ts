import express from "express";
import { signin, signup } from "./auth/auth.controller";
import { getProductcatById, getProductcats } from "./product/productcat.controller";
import { getProducttagById, getProducttags } from "./product/producttag.controller";
import { getProductById, getProducts } from "./product/product.controller";
import { getPostcatById, getPostcats } from "./post/postcat.controller";
import { getPostById, getPosts } from "./post/post.controller";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);

router.get("/product", getProducts);
router.get("/productcat", getProductcats);
router.get("/producttag", getProducttags);
router.get("/post", getPosts);
router.get("/postcat", getPostcats);

router.get("/product/:id", getProductById);
router.get("/productcat/:id", getProductcatById);
router.get("/producttag/:id", getProducttagById);

router.get("/post/:id", getPostById);
router.get("/postcat/:id", getPostcatById);

export default router;
