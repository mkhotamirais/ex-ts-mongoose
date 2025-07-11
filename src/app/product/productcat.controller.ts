import { Request, Response } from "express";
import { Productcats, Products } from "./product.model";
import { errMsg } from "../../helpers/functions";

export const getProductcats = async (req: Request, res: Response) => {
  try {
    const data = await Productcats.find().sort("-createdAt").lean();
    res.status(200).json(data);
  } catch (error) {
    errMsg(error, res);
  }
};

export const getProductcatById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const data = await Productcats.findById(id).lean();
    if (!data) {
      res.status(400).json({ error: `Category id ${id} not found!` });
      return;
    }
    res.status(200).json(data);
  } catch (error) {
    errMsg(error, res);
  }
};

export const createProductcat = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    let errors: Record<string, string | null> | null = { name: null };
    let status = 400;

    if (!name || name === "") errors = { ...errors, name: "Name is required!" };
    if (await Productcats.findOne({ name })) {
      errors = { ...errors, name: "Duplicate name!" };
      status = 409;
    }

    const hasError = Object.values(errors).some((value) => value !== null);
    if (hasError) {
      res.status(status).json({ errors });
      return;
    }

    await Productcats.create(req.body);
    res.status(200).json({ message: `Create ${name} success` });
  } catch (error) {
    errMsg(error, res);
  }
};

export const updateProductcat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    let errors: Record<string, string | null> | null = { name: null };
    let status = 400;

    if (!name || name === "") errors = { ...errors, name: "Name is required!" };
    const dupName = await Productcats.findOne({ name });
    if (dupName && dupName._id.toString() !== id) {
      errors = { ...errors, name: `${name} is already exist` };
      status = 409;
    }

    const hasError = Object.values(errors).some((value) => value !== null);
    if (hasError) {
      res.status(status).json({ errors });
      return;
    }

    const match = await Productcats.findById(id);
    if (!match) {
      res.status(400).json({ error: `Category id ${id} not found!` });
      return;
    }

    await Productcats.findByIdAndUpdate(match._id, req.body, { new: true });
    res.status(200).json({ message: `Update ${name} success` });
  } catch (error) {
    errMsg(error, res);
  }
};

export const deleteProductcat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Productcats.findById(id);
    if (!category) {
      res.json(400).json({ error: `Category id ${id} not found!` });
      return;
    }

    if (category.name === "lainnya") {
      res.status(400).json({ error: `Can't delete ${category.name}!` });
      return;
    }

    const defaultCategory = await Productcats.findOne({ name: "lainnya" });
    if (defaultCategory) {
      await Productcats.updateMany({ category: category.name }, { $set: { category: defaultCategory.name } });
    }

    await Products.updateMany({ category: category._id }, { category: defaultCategory?._id });

    await Productcats.findByIdAndDelete(id);
    res.status(200).json({ message: `Delete ${category.name} success` });
  } catch (error) {
    errMsg(error, res);
  }
};
