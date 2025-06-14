import express from "express";
import routerPublic from "./router.public";
import routerSearch from "./router.search";
import routerUser from "./router.user";
import routerEditor from "./router.editor";
import routerAdmin from "./router.admin";
import routerAllrole from "./router.allrole";
import { authorizeRoles, isLogin } from "../middleware";

const router = express.Router();

router.use(routerPublic);
router.use(routerSearch);
router.use(isLogin);
router.use(authorizeRoles("user"), routerUser);
router.use(authorizeRoles("user", "editor", "admin"), routerAllrole);
router.use(authorizeRoles("editor", "admin"), routerEditor);
router.use(authorizeRoles("admin"), routerAdmin);

export default router;
