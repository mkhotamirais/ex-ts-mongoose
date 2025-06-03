import mongoose from "mongoose";

const producttagSchema = new mongoose.Schema(
  { name: { type: String, required: true, unique: true } },
  { timestamps: true }
  //
);

const productcatSchema = new mongoose.Schema(
  { name: { type: String, required: true, unique: true } },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, requried: true, unique: true },
    price: { type: Number, required: true },
    tag: [{ type: mongoose.Schema.Types.ObjectId, ref: "productTags", required: true }],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "productCategory",
      required: true,
    },
    description: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  {
    timestamps: true,
  }
);

export const Producttags = mongoose.model("productTags", producttagSchema);
export const Productcats = mongoose.model("productCats", productcatSchema);
export const Products = mongoose.model("Products", productSchema);
