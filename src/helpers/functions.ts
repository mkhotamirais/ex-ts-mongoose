import { Request, Response } from "express";
import { IUser } from "./types";
import jwt from "jsonwebtoken";
import { Users } from "../app/auth/auth.model";

const ats = process.env.ACCESS_TOKEN_SECRET as string;
const isProduction = process.env.NODE_ENV === "production";

export const errMsg = (error: any, res: Response) => {
  if (error instanceof Error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const saveCookie = async (res: Response, user: IUser) => {
  const accessToken = jwt.sign({ id: user._id, name: user.name, role: user.role }, ats, { expiresIn: "3d" });
  res.cookie("token-ex-ts-mongoose", accessToken, {
    secure: isProduction,
    httpOnly: true,
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });

  const email = user.email;
  await Users.findOneAndUpdate({ email }, { $push: { accessToken } }, { new: true }).select(["-__v", "-password"]);
};

export const removeCookie = async (req: Request, res: Response, user: IUser) => {
  const accessToken = req.cookies["token-ex-ts-mongoose"];
  if (!accessToken) {
    res.sendStatus(204); //no content
    return;
  }

  res.clearCookie("token-ex-ts-mongoose", {
    secure: isProduction,
    httpOnly: true,
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });

  const email = user.email;
  await Users.findOneAndUpdate({ email }, { $pull: { accessToken } }, { new: true });
};
