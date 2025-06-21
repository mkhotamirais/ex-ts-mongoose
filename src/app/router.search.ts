import express, { Request, Response } from "express";
import { Posts } from "./post/post.model";
import { Products } from "./product/product.model";
import { errMsg } from "../helpers/functions";

const router = express.Router();

router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = req.query.search || "";
    const posts = await Posts.find({ title: { $regex: query, $options: "i" } })
      .select(["title", "imageUrl"])
      .lean();
    const products = await Products.find({
      $or: [{ name: { $regex: query, $options: "i" } }, { description: { $regex: query, $options: "i" } }],
    })
      .select(["name", "price", "imageUrl"])
      .lean();

    res.status(200).json({ posts, products });
  } catch (error) {
    errMsg(error, res);
  }
});

export default router;
