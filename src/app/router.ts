import express from "express";
import { deleteMe, getMe, signin, signout, signup, updateMe } from "./auth/auth.controller";
import { deleteUser, getUserById, getUsers, updateUser } from "./auth/user.controller";
import { isLogin } from "../middleware";
// import { deleteMe, getMe, signin, signout, signup, updateMe } from "./auth.controller";
// import { createProduct, deleteProduct, readProductById, readProducts, updateProduct } from "./product.controller";
// import { deleteUser, readUserById, readUsers, updateUser } from "./user.controller";
// import { isLogin } from "middleware";
// import { createTag, deleteTag, readTagById, readTags, updateTag } from "./tag.controller";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout", signout);

router.route("/users").get(getUsers);
router.route("/users/:id").get(getUserById).patch(updateUser).delete(deleteUser);

// router.route("/product").get(readProducts).post(createProduct);
// router.route("/category").get(readCategories).post(createCategory);
// router.route("/tag").get(readTags).post(createTag);

// router.use(isLogin);
router.route("/me").get(isLogin, getMe).patch(updateMe).delete(deleteMe);
router.patch("/signout", signout);

// router.use(isAdmin);
// router.route("/product/:id").get(readProductById).patch(updateProduct).delete(deleteProduct);
// router.route("/category/:id").get(readCategoryById).patch(updateCategory).delete(deleteCategory);
// router.route("/tag/:id").get(readTagById).patch(updateTag).delete(deleteTag);

export default router;
