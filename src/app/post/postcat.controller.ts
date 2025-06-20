import { Request, Response } from "express";
import { Postcats } from "./post.model";
import { errMsg } from "../../helpers/functions";

export const getPostcats = async (req: Request, res: Response) => {
  try {
    const data = await Postcats.find().sort("-createdAt").lean();
    res.status(200).json(data);
  } catch (error) {
    errMsg(error, res);
  }
};

export const getPostcatById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await Postcats.findById(id).lean();
    if (!data) {
      res.status(400).json({ error: `Category id ${id} not found!` });
      return;
    }
    res.status(200).json(data);
  } catch (error) {
    errMsg(error, res);
  }
};

export const createPostcat = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    let errors: Record<string, string | null> | null = { name: null };
    let status = 400;

    if (!name || name === "") errors = { ...errors, name: "Name is required!" };
    if (await Postcats.findOne({ name })) {
      errors = { ...errors, name: "Duplicate name!" };
      status = 409;
    }

    const hasError = Object.values(errors).some((value) => value !== null);
    if (hasError) {
      res.status(status).json({ errors });
      return;
    }

    await Postcats.create(req.body);
    res.status(200).json({ message: `Create ${name} success` });
  } catch (error) {
    errMsg(error, res);
  }
};

export const updatePostcat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    let errors: Record<string, string | null> | null = { name: null };
    let status = 400;

    if (!name || name === "") errors = { ...errors, name: "Name is required!" };
    const dupName = await Postcats.findOne({ name });
    if (dupName && dupName._id.toString() !== id) {
      errors = { ...errors, name: `${name} is already exist` };
      status = 409;
    }

    const hasError = Object.values(errors).some((value) => value !== null);
    if (hasError) {
      res.status(status).json({ errors });
      return;
    }

    const match = await Postcats.findById(id);
    if (!match) {
      res.status(400).json({ error: `Category id ${id} not found!` });
      return;
    }

    await Postcats.findByIdAndUpdate(match._id, req.body, { new: true });
    res.status(200).json({ message: `Update ${name} success` });
  } catch (error) {
    errMsg(error, res);
  }
};

export const deletePostcat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await Postcats.findById(id);
    if (!data) {
      res.json(400).json({ error: `Category id ${id} not found!` });
      return;
    }
    await Postcats.findByIdAndDelete(id);
    res.status(200).json({ message: `Delete ${data.name} success` });
  } catch (error) {
    errMsg(error, res);
  }
};
