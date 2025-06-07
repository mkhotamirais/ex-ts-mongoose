import express from "express";
import routerPublic from "./router.public";
import routerUser from "./router.user";
import routerEditor from "./router.editor";
import routerAdmin from "./router.admin";
import { authorizeRoles, isLogin } from "../middleware";

const router = express.Router();

router.use(routerPublic);
router.use(isLogin);
router.use(authorizeRoles("user, admin, editor"), routerUser);
router.use(authorizeRoles("editor, admin"), routerEditor);
router.use(authorizeRoles("admin"), routerAdmin);

export default router;
