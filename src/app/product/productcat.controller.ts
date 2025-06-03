import { Request, Response } from "express";
import { Productcats } from "./product.model";

export const readCategories = async (req: Request, res: Response) => {
  try {
    const data = await Productcats.find().sort("-createdAt");
    res.status(200).json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};

export const readCategoryById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const data = await Productcats.findById(id);
    if (!data) return res.status(400).json({ error: `Category id ${id} not found!` });
    res.status(200).json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};

export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name || name === "") return res.status(400).json({ error: `Name is required!` });
  try {
    const dupName = await Productcats.findOne({ name });
    if (dupName) return res.status(409).json({ error: `Duplicate name!` });
    await Productcats.create(req.body);
    res.status(200).json({ message: `Post ${name} success` });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || name === "") return res.status(400).json({ error: `Name is required!` });
  try {
    const match = await Productcats.findById(id);
    if (!match) return res.status(400).json({ error: `Category id ${id} not found!` });
    const dupName = await Productcats.findOne({ name });
    if (dupName && dupName.name !== name) return res.status(409).json({ error: "Duplicate name!" });
    await Productcats.findByIdAndUpdate(match._id, req.body, { new: true });
    res.status(200).json({ message: `Update ${name} success` });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const data = await Productcats.findById(id);
    if (!data) return res.json(400).json({ error: `Category id ${id} not found!` });
    await Productcats.findByIdAndDelete(id);
    res.status(200).json({ message: `Delete ${data.name} success` });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};
