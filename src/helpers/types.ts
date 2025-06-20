import { Request } from "express";
import { Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  accessToken: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export type JwtPayload = {
  id: string;
  name: string;
  role: "user" | "admin";
};

export type ProductType = {
  skip?: number;
  limit?: number;
  q?: string;
  category?: string;
  tags?: string | string[];
  sort?: string;
};

export type PostQuery = {
  q?: string;
};
