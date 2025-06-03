import { Request, Response } from "express";
import { Producttags } from "./product.model";

export const getProductTags = async (req: Request, res: Response) => {
  try {
    const data = await Producttags.find().sort("-createdAt");
    res.status(200).json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};

export const readTagById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const data = await Producttags.findById(id);
    if (!data) return res.status(400).json({ error: `Tag id ${id} not found!` });
    res.status(200).json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};

export const createTag = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name || name === "") {
    res.status(400).json({ error: `Name is required!` });
    return;
  }
  try {
    const dupName = await Producttags.findOne({ name });
    if (dupName) {
      res.status(409).json({ error: `Duplicate name!` });
      return;
    }
    await Producttags.create(req.body);
    res.status(200).json({ message: `Post ${name} success` });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};

export const updateTag = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || name === "") return res.status(400).json({ error: `Name is required!` });
  try {
    const match = await Producttags.findById(id);
    if (!match) return res.status(400).json({ error: `Tag id ${id} not found!` });
    const dupName = await Producttags.findOne({ name });
    if (dupName && dupName.name !== name) return res.status(409).json({ error: "Duplicate name!" });
    await Producttags.findByIdAndUpdate(match._id, req.body, { new: true });
    res.status(200).json({ message: `Update ${name} success` });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};

export const deleteTag = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const data = await Producttags.findById(id);
    if (!data) return res.json(400).json({ error: `Tag id ${id} not found!` });
    await Producttags.findByIdAndDelete(id);
    res.status(200).json({ message: `Delete ${data.name} success` });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};
