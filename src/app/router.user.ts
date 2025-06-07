import express from "express";
import { deleteMe, getMe, signout, updateMe } from "./auth/auth.controller";

const router = express.Router();

router.route("/me").get(getMe).patch(updateMe).delete(deleteMe);
router.patch("/signout", signout);

export default router;
