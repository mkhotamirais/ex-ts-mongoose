import { AuthRequest, ProductQuery } from "../../helpers/types";
import { Request, Response } from "express";
import { Carts, Productcats, Products } from "./product.model";
import cloudinary from "../../helpers/cloudinary";
import { errMsg } from "../../helpers/functions";
import { unlinkSync } from "fs";

export const getProducts = async (req: Request, res: Response) => {
  const {
    productlimit = 8,
    productq = "",
    productcategory = "",
    producttags: rawTags = [],
    productsort = "-createdAt",
    productpage = 1,
  }: ProductQuery = req.query;
  let criteria: Record<string, any> = {};

  const tags = typeof rawTags === "string" ? rawTags.split(",") : Array.isArray(rawTags) ? rawTags : [];
  const skip = (productpage - 1) * productlimit;

  if (productq.length) criteria = { ...criteria, name: { $regex: `${productq}`, $options: "i" } };
  if (productcategory.length) criteria = { ...criteria, category: productcategory };
  if (tags.length) criteria = { ...criteria, tags: { $in: tags } };
  try {
    // const options = { sort: [["group.name", "asc"]] };
    const total = await Products.countDocuments(criteria);
    const data = await Products.find(criteria)
      .skip(skip)
      .limit(productlimit)
      .sort(productsort)
      .collation({ locale: "en", strength: 2 })
      .populate({ path: "category", select: "name" })
      .populate({ path: "tags", select: ["name"] })
      .populate({ path: "user", select: ["username"] })
      .select("-__v")
      .lean();

    res.status(200).json({ products: data, total });
  } catch (error) {
    errMsg(error, res);
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const data = await Products.findById(id)
      .populate({ path: "category", select: ["name"] })
      .populate({ path: "tags", select: ["name"] })
      .populate({ path: "user", select: ["username"] })
      .lean();
    if (!data) {
      res.status(404).json({ error: `Data ${id} not found!` });
      return;
    }
    res.status(200).json(data);
  } catch (error) {
    errMsg(error, res);
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, description } = req.body;
    let errors: Record<string, string | null> | null = { name: null, price: null, description: null };
    let status = 400;

    if (!name || name === "") errors = { ...errors, name: "Name is required!" };
    const dupName = await Products.findOne({ name });
    if (dupName) {
      errors = { ...errors, name: `${name} is already exist` };
      status = 409;
    }
    if (!price || price === "") errors = { ...errors, price: "Price is required!" };
    if (!description || description === "") errors = { ...errors, description: "Description is required!" };

    if (req.file) {
      if (req.file.size > 2000000) {
        errors = { ...errors, image: "Image size must be less than 2MB!" };
        status = 400;
      } else {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: "ex-ts-mongoose-products" });

        req.body.imageUrl = uploadResult.secure_url;
        req.body.cldId = uploadResult.public_id;
      }
      unlinkSync(req.file.path);
    }

    const hasError = Object.values(errors).some((value) => value !== null);
    if (hasError) {
      res.status(status).json({ errors });
      return;
    }

    const defaultCategory = await Productcats.findOne({ name: "lainnya" });
    if (!defaultCategory) {
      await Productcats.create({ name: "lainnya" });
    }

    req.body.category = req.body.category ? req.body.category : defaultCategory?._id;

    await Products.create(req.body);
    res.status(201).json({ message: `Post ${name} success` });
  } catch (error) {
    errMsg(error, res);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await Products.findById(id);
    if (!data) {
      res.status(400).json({ error: `Data id ${id} not found!` });
      return;
    }

    const { name, price, description } = req.body;
    let errors: Record<string, string | null> | null = { name: null, price: null, description: null };
    let status = 400;

    if (!name || name === "") errors = { ...errors, name: "Name is required!" };
    const dupName = await Products.findOne({ name });
    if (dupName && dupName._id.toString() !== id) {
      errors = { ...errors, name: `${name} is already exist` };
      status = 409;
    }
    if (!price || price === "") errors = { ...errors, price: "Price is required!" };
    if (!description || description === "") errors = { ...errors, description: "Description is required!" };

    let imageUrl = data.imageUrl ? data.imageUrl : null;
    let cldId = data?.cldId ? data.cldId : null;

    if (req.file) {
      if (req.file.size > 1000000) {
        errors = { ...errors, image: "Image size must be less than 1MB!" };
        status = 400;
      } else {
        if (cldId) {
          await cloudinary.uploader.destroy(cldId);
        }

        const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: "ex-ts-mongoose-products" });

        imageUrl = uploadResult.secure_url;
        cldId = uploadResult.public_id;
      }
      unlinkSync(req.file.path);
    }

    const defaultCategory = await Productcats.findOne({ name: "lainnya" });
    if (!defaultCategory) {
      await Productcats.create({ name: "lainnya" });
    }

    req.body.category = req.body.category ? req.body.category : defaultCategory?._id;
    req.body.imageUrl = imageUrl;
    req.body.cldId = cldId;

    const hasError = Object.values(errors).some((value) => value !== null);
    if (hasError) {
      res.status(status).json({ errors });
      return;
    }

    await Products.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: `Update ${name} success` });
  } catch (error) {
    errMsg(error, res);
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

    if (data?.cldId) {
      await cloudinary.uploader.destroy(data.cldId as string);
    }

    // Hapus produk dari semua cart
    await Carts.updateMany({}, { $pull: { items: { productId: id } } });

    await Products.findByIdAndDelete(id);
    res.status(200).json({ message: `Delete ${data.name} success` });
  } catch (error) {
    errMsg(error, res);
  }
};
