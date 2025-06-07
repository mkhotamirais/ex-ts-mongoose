import { AuthRequest, ProductType } from "../../helpers/types";
import { Request, Response } from "express";
import { Products } from "./product.model";

export const getProducts = async (req: Request, res: Response) => {
  const { skip = 0, limit = 0, q = "", category = "", tags = [], sort = "-createdAt" }: ProductType = req.query;
  let criteria: Record<string, any> = {};
  if (q.length) criteria = { ...criteria, name: { $regex: `${q}`, $options: "i" } };
  if (category.length) criteria = { ...criteria, category };
  if (tags.length) criteria = { ...criteria, tag: { $in: tags } };
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
      .populate({ path: "tags", select: ["name"] })
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

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const data = await Products.findById(id)
      .populate({ path: "category", select: ["name"] })
      .populate({ path: "tags", select: ["name"] })
      .populate({ path: "user", select: ["username"] });
    if (!data) {
      res.status(404).json({ error: `Data ${id} not found!` });
      return;
    }
    res.status(200).json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, tags, category, description } = req.body;
    let errors: Record<string, string | null> | null = {
      name: null,
      price: null,
      tags: null,
      category: null,
      description: null,
    };
    let status = 400;

    if (!name || name === "") errors = { ...errors, name: "Name is required!" };
    const dupName = await Products.findOne({ name });
    if (dupName) {
      errors = { ...errors, name: `${name} is already exist` };
      status = 409;
    }
    if (!price || price === "") errors = { ...errors, price: "Price is required!" };
    if (!tags || tags.length === 0) errors = { ...errors, tags: "Tags is required!" };
    if (!category || category === "") errors = { ...errors, category: "Category is required!" };
    if (!description || description === "") errors = { ...errors, description: "Description is required!" };

    const hasError = Object.values(errors).some((value) => value !== null);
    if (hasError) {
      res.status(status).json({ errors });
      return;
    }

    req.body.user = req.user?.id;
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
  try {
    const { id } = req.params;
    const { name, price, tags, category, description } = req.body;
    let errors: Record<string, string | null> | null = {
      name: null,
      price: null,
      tags: null,
      category: null,
      description: null,
    };
    let status = 400;

    if (!name || name === "") errors = { ...errors, name: "Name is required!" };
    const dupName = await Products.findOne({ name });
    if (dupName && dupName._id.toString() !== id) {
      errors = { ...errors, name: `${name} is already exist` };
      status = 409;
    }
    if (!price || price === "") errors = { ...errors, price: "Price is required!" };
    if (!tags || tags.length === 0) errors = { ...errors, tags: "Tags is required!" };
    if (!category || category === "") errors = { ...errors, category: "Category is required!" };
    if (!description || description === "") errors = { ...errors, description: "Description is required!" };

    const hasError = Object.values(errors).some((value) => value !== null);
    if (hasError) {
      res.status(status).json({ errors });
      return;
    }

    const data = await Products.findById(id);
    if (!data) {
      res.status(400).json({ error: `Product id ${id} not found!` });
      return;
    }

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
    if (!data) {
      res.status(400).json({ error: `Data id ${id} not found!` });
      return;
    }
    await Products.findByIdAndDelete(id);
    res.status(200).json({ message: `Delete ${data.name} success` });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  }
};
