import express from "express";
import { signout } from "./auth/auth.controller";
import { changePassword, deleteAccount, getAccount, updateAccount } from "./auth/account.controller";

const router = express.Router();

router.route("/account").get(getAccount).patch(updateAccount).delete(deleteAccount);
router.patch("/account/password", changePassword);
router.patch("/signout", signout);

export default router;
