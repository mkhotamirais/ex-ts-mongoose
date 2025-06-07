import express from "express";
import { deleteUser, getUserById, getUsers, updateUser } from "./auth/user.controller";

const router = express.Router();

router.route("/users").get(getUsers);
router.route("/users/:id").get(getUserById).patch(updateUser).delete(deleteUser);

export default router;
