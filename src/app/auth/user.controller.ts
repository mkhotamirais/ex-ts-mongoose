import { genSalt, hash } from "bcrypt";
import { Request, Response } from "express";
import { Users } from "./auth.model";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const data = await Users.find().select(["-password", "-accessToken", "-__v"]).lean();
    res.status(200).json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const data = await Users.findById(id).select(["-password", "-accessToken", "-__v"]).lean();
    res.status(200).json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password, confPassword } = req.body;
  if (!name || !email) {
    res.status(400).json({ error: "Name and email is required!" });
    return;
  }

  try {
    const data = await Users.findById(id);
    if (!data) {
      res.status(400).json({ error: `Data id ${id} not found!` });
      return;
    }
    const dupName = await Users.findOne({ name });
    const dupEmail = await Users.findOne({ email });

    if (dupName && dupName.name !== name) {
      res.status(409).json({ error: "Duplicate name!" });
      return;
    }

    if (dupEmail && dupEmail.email !== email) {
      res.status(409).json({ error: "Duplicate email!" });
      return;
    }

    if (data.email === "ahmad@gmail.com") {
      res.status(400).json({ error: `You cannot change any of primary admin data` });
      return;
    }

    if (password) {
      if (password !== confPassword) {
        res.status(400).json({ error: "Wrong confirm password!" });
        return;
      }
      const salt = await genSalt(10);
      const hashPass = await hash(password, salt);
      req.body.password = hashPass;
    } else {
      req.body.password = data.password;
    }

    await Users.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    res.status(200).json({ message: `Update ${name} success` });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const data = await Users.findById(id);
    if (!data) {
      res.status(400).json({ error: `Data id ${id} not found!` });
      return;
    }

    if (data.role === "admin") {
      res.status(400).json({ error: `Admin role cannot be deleted!` });
      return;
    }

    if (data.email === "ahmad@gmail.com") {
      res.status(400).json({ error: `The primary admin cannot be deleted` });
      return;
    }

    await Users.findByIdAndDelete(id);
    res.status(200).json({ message: `Delete ${data.name} success` });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};
