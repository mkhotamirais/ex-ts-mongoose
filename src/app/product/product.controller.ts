import { ProductType } from "helpers/types";
import { Request, Response } from "express";
import { Products } from "./product.model";

export const readProducts = async (req: Request, res: Response) => {
  const { skip = 0, limit = 0, q = "", category = "", tag = [], sort = "-createdAt" }: ProductType = req.query;
  let criteria: Record<string, any> = {};
  if (q.length) criteria = { ...criteria, name: { $regex: `${q}`, $options: "i" } };
  if (category.length) criteria = { ...criteria, category };
  if (tag.length) criteria = { ...criteria, tag: { $in: tag } };
  try {
    // const options = { sort: [["group.name", "asc"]] };
    const count = await Products.countDocuments(criteria);
    const data = await Products.find(criteria)
      // .skip(parseInt(skip))
      // .limit(parseInt(limit))
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .populate({ path: "category", select: "name" })
      .populate({ path: "tag", select: ["name"] })
      .populate({ path: "user", select: ["username"] })
      .select("-__v");
    res.status(200).json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};

export const readProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const data = await Products.findById(id)
      .populate({ path: "category", select: ["name"] })
      .populate({ path: "tag", select: ["name"] })
      .populate({ path: "user", select: ["username"] });
    if (!data) return res.status(404).json({ error: `Data ${id} not found!` });
    res.status(200).json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, price, tag, category, description } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required!" });
  if (!price) return res.status(400).json({ error: "Price is required!" });
  if (!tag) return res.status(400).json({ error: "Tag is required!" });
  if (!category) return res.status(400).json({ error: "Category is required!" });
  if (!description) return res.status(400).json({ error: "Description is required!" });
  try {
    const dupName = await Products.findOne({ name });
    if (dupName) return res.status(409).json({ error: "Duplicate name!" });

    req.body.user = (req as any).user?.id;
    await Products.create(req.body);
    res.status(201).json({ message: `Post ${name} success` });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price, tag, category, description } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required!" });
  if (!price) return res.status(400).json({ error: "Price is required!" });
  if (!tag) return res.status(400).json({ error: "Tag is required!" });
  if (!category) return res.status(400).json({ error: "Category is required!" });
  if (!description) return res.status(400).json({ error: "Description is required!" });

  try {
    const data = await Products.findById(id);
    if (!data) return res.status(400).json({ error: `Product id ${id} not found!` });

    const dupName = await Products.findOne({ name });
    if (dupName && dupName.name !== name) return res.status(409).json({ error: "Duplicate name!" });

    await Products.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: `Update ${name} success` });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const data = await Products.findById(id);
    if (!data) return res.status(400).json({ error: `Data id ${id} not found!` });
    await Products.findByIdAndDelete(id);
    res.status(200).json({ message: `Delete ${data.name} success` });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};
