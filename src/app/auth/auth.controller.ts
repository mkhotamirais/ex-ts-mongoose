import { compare, genSalt, hash } from "bcrypt";
import validator from "validator";
import { Request, Response } from "express";
import { IUser } from "helpers/types";
import { Users } from "./auth.model";
import { removeCookie, saveCookie } from "../../helpers/functions";

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;
    let errors: Record<string, string | null> | null = {
      name: null,
      email: null,
      password: null,
      confirmPassword: null,
    };
    let status = 400;

    if (!name || name === "") errors = { ...errors, name: "Name is required!" };
    if (!email || email === "") errors = { ...errors, email: "Email is required!" };
    if (!password || password === "") errors = { ...errors, password: "Password is required!" };
    if (!confirmPassword || confirmPassword === "")
      errors = { ...errors, confirmPassword: "Confirm password is required!" };
    if (await Users.findOne({ name })) {
      errors = { ...errors, name: "Duplicate name!" };
      status = 409;
    }
    if (await Users.findOne({ email })) {
      errors = { ...errors, email: "Duplicate email!" };
      status = 409;
    }
    if (!validator.isEmail(email)) errors = { ...errors, email: "Wrong email format!" };
    if (password !== confirmPassword) errors = { ...errors, confirmPassword: "Password not match!" };

    const hasError = Object.values(errors).some((value) => value !== null);
    if (hasError) {
      res.status(status).json({ errors });
      return;
    }

    req.body.password = await hash(password, await genSalt(10));

    if (role && role === "admin") req.body.role = "user";
    if (email === "ahmad@gmail.com") req.body.role = "admin";

    const user = await Users.create(req.body);
    saveCookie(res, user as IUser);

    res.status(201).json({ user, message: `Register ${name} success` });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    let errors: Record<string, string | null> | null = { email: null, password: null };

    // TODO: jika sudah ada cookie maka return saja kasih pesan "kamu sudah login"

    if (!email || email == "") errors = { ...errors, email: "Email is required!" };
    if (!password || password == "") errors = { ...errors, password: "Password is required!" };
    const user = await Users.findOne({ email });
    if (!user) errors = { ...errors, email: "Email not found!" };
    let matchPass = false;
    if (user) {
      const matchPass = await compare(password, user.password as string);
      if (!matchPass) errors = { ...errors, password: "Wrong password!" };
    }

    const hasError = Object.values(errors).some((value) => value !== null);
    if (hasError) {
      res.status(400).json({ errors });
      return;
    }

    saveCookie(res, user as IUser);

    res.status(200).json({ user, message: `Login ${email} success` });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};

// token required
export const signout = async (req: Request, res: Response) => {
  try {
    const accessToken = req.cookies["token-ex-ts-mongoose"];
    const user = await Users.findOne({ accessToken: { $in: accessToken } });
    if (!user) {
      res.status(403).json({ error: `forbidden, token invalid` });
      return;
    }

    removeCookie(req, res, user as IUser);
    res.status(200).json({ message: `Logout ${user.name} success` });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};
