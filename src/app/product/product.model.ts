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
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "productTags", required: true }],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "productCats",
      default: null,
    },
    description: { type: String },
    imageUrl: { type: String },
    cldId: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  {
    timestamps: true,
  }
);

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "products", required: true },
  qty: { type: Number, required: true },
});

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

interface OrderItem {
  productId: mongoose.Types.ObjectId;
  qty: number;
  price: number;
}

interface Address {
  label: string;
  province: string;
  regency: string;
  district: string;
  village: string;
  postalCode: string;
  fullAddress: string;
  isDefault?: boolean;
}

export interface OrderDocument extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  items: OrderItem[];
  address: Address;
  // paymentMethod: string;
  total: number;
  status: "pending" | "paid" | "shipped" | "cancelled";
  createdAt: Date;
}

const orderSchema = new mongoose.Schema<OrderDocument>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "products", required: true },
      qty: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  address: {
    label: { type: String, required: true },
    province: { type: String, required: true },
    regency: { type: String, required: true },
    district: { type: String, required: true },
    village: { type: String, required: true },
    postalCode: { type: String, required: true },
    fullAddress: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  // paymentMethod: { type: String, required: true },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "paid", "shipped", "cancelled"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export const Producttags = mongoose.model("productTags", producttagSchema);
export const Productcats = mongoose.model("productCats", productcatSchema);
export const Products = mongoose.model("products", productSchema);
export const Carts = mongoose.model("carts", cartSchema);
export const Orders = mongoose.model("orders", orderSchema);
