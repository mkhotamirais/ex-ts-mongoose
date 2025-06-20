import { Request, Response } from "express";
import { Producttags } from "./product.model";
import { errMsg } from "../../helpers/functions";

export const getProducttags = async (req: Request, res: Response) => {
  try {
    const data = await Producttags.find().sort("-createdAt").lean();
    res.status(200).json(data);
  } catch (error) {
    errMsg(error, res);
  }
};

export const getProducttagById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await Producttags.findById(id).lean();
    if (!data) {
      res.status(400).json({ error: `Tag id ${id} not found!` });
      return;
    }
    res.status(200).json(data);
  } catch (error) {
    errMsg(error, res);
  }
};

export const createProducttag = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    let errors: Record<string, string | null> | null = { name: null };
    let status = 400;

    if (!name || name === "") errors = { ...errors, name: "Name is required!" };
    if (await Producttags.findOne({ name })) {
      errors = { ...errors, name: "Duplicate name!" };
      status = 409;
    }

    const hasError = Object.values(errors).some((value) => value !== null);
    if (hasError) {
      res.status(status).json({ errors });
      return;
    }

    await Producttags.create(req.body);
    res.status(200).json({ message: `Post ${name} success` });
  } catch (error) {
    errMsg(error, res);
  }
};

export const updateProducttag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    let errors: Record<string, string | null> | null = { name: null };
    let status = 400;

    if (!name || name === "") errors = { ...errors, name: "Name is required!" };
    const dupName = await Producttags.findOne({ name });
    if (dupName && dupName._id.toString() !== id) {
      errors = { ...errors, name: `${name} is already exist` };
      status = 409;
    }

    const hasError = Object.values(errors).some((value) => value !== null);
    if (hasError) {
      res.status(status).json({ errors });
      return;
    }

    const match = await Producttags.findById(id);
    if (!match) {
      res.status(400).json({ error: `Tag id ${id} not found!` });
      return;
    }

    await Producttags.findByIdAndUpdate(match._id, req.body, { new: true });
    res.status(200).json({ message: `Update ${name} success` });
  } catch (error) {
    errMsg(error, res);
  }
};

export const deleteProducttag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await Producttags.findById(id);
    if (!data) {
      res.json(400).json({ error: `Tag id ${id} not found!` });
      return;
    }
    await Producttags.findByIdAndDelete(id);
    res.status(200).json({ message: `Delete ${data.name} success` });
  } catch (error) {
    errMsg(error, res);
  }
};
