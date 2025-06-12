import mongoose from "mongoose";

const postcatSchema = new mongoose.Schema(
  { name: { type: String, required: true, unique: true } },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "postCats",
      default: null,
    },
    imageUrl: { type: String },
    cldId: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  {
    timestamps: true,
  }
);

export const Postcats = mongoose.model("postCats", postcatSchema);
export const Posts = mongoose.model("posts", postSchema);
