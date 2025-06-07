import fs from "fs";
import path from "path";
import url from "url";
import { v4 as uuidv4 } from "uuid";

const data = {
  products: JSON.parse(fs.readFileSync(new URL("./product.json", import.meta.url))),
  setProducts(data) {
    this.products = data;
  },
};

export const getProducts = (req, res) => {
  const result = data.products.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  res.status(200).json(result);
};

export const getProductById = (req, res) => {
  const { id } = req.params;
  const match = data.products.find((p) => p.id === id);
  if (!match) return res.status(400).json({ error: `data id ${id} tidak ditemukan` });
  res.status(200).json(match);
};

export const postProduct = (req, res) => {
  const { name, price } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });
  if (!price) return res.status(400).json({ error: "price is required" });
  const dupName = data.products.find((e) => e.name === name);
  if (dupName) return res.status(409).json({ error: "duplicate name" });
  req.body.id = uuidv4();
  req.body.createdAt = new Date().toISOString();
  req.body.updatedAt = new Date().toISOString();
  data.setProducts([...data.products, req.body]);
  fs.writeFileSync(
    path.join(path.dirname(url.fileURLToPath(import.meta.url)), "product.json"),
    JSON.stringify(data.products)
  );
  res.status(201).json({ message: `post ${name} success` });
};

export const updateProduct = (req, res) => {
  const { id } = req.params;
  const match = data.products.find((e) => e.id?.toString() === id);
  if (!match) return res.status(400).json({ error: `data id ${id} tidak ditemukan` });
  const { name, price } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });
  if (!price) return res.status(400).json({ error: "price is required" });
  req.body.updatedAt = new Date().toISOString();
  const otherData = data.products.filter((e) => e.id !== id);
  const currentData = { ...match, ...req.body };
  data.setProducts([...otherData, currentData]);
  fs.writeFileSync(
    path.join(path.dirname(url.fileURLToPath(import.meta.url)), "product.json"),
    JSON.stringify(data.products)
  );
  res.status(200).json({ message: `update ${name} success` });
};

export const deleteProduct = (req, res) => {
  const { id } = req.params;
  const match = data.products.find((p) => p.id.toString() === id);
  if (!match) return res.status(400).json({ error: `data id ${id} tidak ditemukan` });
  const otherData = data.products.filter((p) => p.id !== id);
  data.setProducts(otherData);
  fs.writeFileSync(
    path.join(path.dirname(url.fileURLToPath(import.meta.url)), "product.json"),
    JSON.stringify(data.products)
  );
  res.status(200).json({ message: "delete data success" });
};
