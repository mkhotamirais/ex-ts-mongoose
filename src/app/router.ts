import express from "express";
import routerPublic from "./router.public";
import routerSearch from "./router.search";
import routerUser from "./router.user";
import routerEditor from "./router.editor";
import routerAdmin from "./router.admin";
import routerAllrole from "./router.allrole";
import { authorizeRoles, isLogin } from "../middleware";

const router = express.Router();

router.use("/public", routerPublic);
router.use("/search", routerSearch);
router.use(isLogin);
router.use("/user", authorizeRoles("user"), routerUser);
router.use("/common", authorizeRoles("user", "editor", "admin"), routerAllrole);
router.use("/editor", authorizeRoles("editor", "admin"), routerEditor);
router.use("/admin", authorizeRoles("admin"), routerAdmin);

export default router;
