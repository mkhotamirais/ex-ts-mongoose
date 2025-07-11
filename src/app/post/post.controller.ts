import { Request, Response } from "express";
import { errMsg } from "../../helpers/functions";
import { Postcats, Posts } from "./post.model";
import cloudinary from "../../helpers/cloudinary";
import { unlinkSync } from "fs";
import { AuthRequest, PostQuery } from "../../helpers/types";

export const getPosts = async (req: Request, res: Response) => {
  try {
    const { postskip = 0, postlimit = 0, postq = "" }: PostQuery = req.query;
    let criteria: Record<string, any> = {};

    if (postq.length) criteria = { ...criteria, title: { $regex: `${postq}`, $options: "i" } };

    const data = await Posts.find(criteria)
      .skip(postskip)
      .limit(postlimit)
      .populate({ path: "category", select: "name" })
      .sort("-createdAt")
      .lean();

    res.status(200).json({ posts: data });
  } catch (error) {
    errMsg(error, res);
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await Posts.findById(id).lean();
    if (!data) {
      res.status(400).json({ error: `Post id ${id} not found!` });
      return;
    }
    res.status(200).json(data);
  } catch (error) {
    errMsg(error, res);
  }
};

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, category } = req.body;

    let errors: Record<string, string | null> | null = { title: null, content: null, category: null };
    let status = 400;

    if (!title || title === "") errors = { ...errors, title: "Title is required!" };
    if (!content || content === "") errors = { ...errors, content: "Content is required!" };

    if (await Posts.findOne({ title })) {
      errors = { ...errors, title: "Duplicate title!" };
      status = 409;
    }

    if (req.file) {
      if (req.file.size > 1000000) {
        errors = { ...errors, image: "Image size must be less than 1MB!" };
        status = 400;
      } else {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "ex-ts-mongoose-posts",
        });

        req.body.imageUrl = uploadResult.secure_url;
        req.body.cldId = uploadResult.public_id;
      }
      unlinkSync(req.file.path);
    }

    const defaultCategory = await Postcats.findOne({ name: "lainnya" });
    if (!defaultCategory) {
      await Postcats.create({ name: "lainnya" });
    }

    req.body.category = (await Postcats.findOne({ name: category })) || defaultCategory?._id;

    const hasError = Object.values(errors).some((value) => value !== null);
    if (hasError) {
      res.status(status).json({ errors });
      return;
    }

    req.body.user = req.user?._id;
    await Posts.create(req.body);
    res.status(200).json({ message: `Create ${title} success` });
  } catch (error) {
    errMsg(error, res);
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = await Posts.findById(id);
    if (!data) {
      res.status(400).json({ error: `Post id ${id} not found!` });
      return;
    }

    const { title, content, category } = req.body;
    req.body.user = req.user?._id;
    let errors: Record<string, string | null> | null = { title: null, content: null, category: null };
    let status = 400;

    if (!title || title === "") errors = { ...errors, title: "Title is required!" };
    if (!content || content === "") errors = { ...errors, content: "Content is required!" };

    const dup = await Posts.findOne({ title });
    if (dup && dup._id.toString() !== id) {
      errors = { ...errors, name: `${title} is already exist` };
      status = 409;
    }

    let imageUrl = data.imageUrl;
    let cldId = data?.cldId ? data.cldId : null;

    if (req.file) {
      if (req.file.size > 1000000) {
        errors = { ...errors, image: "Image size must be less than 1MB!" };
        status = 400;
      } else {
        if (cldId) {
          await cloudinary.uploader.destroy(cldId);
        }

        const uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: "ex-ts-mongoose-posts" });

        imageUrl = uploadResult.secure_url;
        cldId = uploadResult.public_id;
      }
      unlinkSync(req.file.path);
    }

    const defaultCategory = await Postcats.findOne({ name: "lainnya" });
    if (!defaultCategory) {
      await Postcats.create({ name: "lainnya" });
    }

    req.body.category = req.body.category || defaultCategory?._id;

    req.body.imageUrl = imageUrl;
    req.body.cldId = cldId;

    const hasError = Object.values(errors).some((value) => value !== null);
    if (hasError) {
      res.status(status).json({ errors });
      return;
    }

    await Posts.findByIdAndUpdate(data._id, req.body, { new: true });
    res.status(200).json({ message: `Update ${title} success` });
  } catch (error) {
    errMsg(error, res);
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await Posts.findById(id);
    if (!data) {
      res.json(400).json({ error: `Post id ${id} not found!` });
      return;
    }

    if (data?.cldId) {
      await cloudinary.uploader.destroy(data.cldId as string);
    }

    await Posts.findByIdAndDelete(id);
    res.status(200).json({ message: `Delete ${data.title} success` });
  } catch (error) {
    errMsg(error, res);
  }
};
