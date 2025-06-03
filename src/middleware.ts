import { allowedOrigins } from "./helpers/constants";
import { Request, Response, NextFunction } from "express";
import { Users } from "./app/auth/auth.model";
import jwt from "jsonwebtoken";
import { AuthRequest, IUser, JwtPayload } from "./helpers/types";

const ats = process.env.ACCESS_TOKEN_SECRET as string;

export const credentials = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin as string)) {
    res.header("Access-Control-Allow-Credentials", "true");
  }
  next();
};

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    allowedOrigins.indexOf(origin as string) !== -1 || !origin
      ? callback(null, true)
      : callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export const isLogin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies["token-ex-ts-mongoose"] as string;
    if (!token) {
      res.status(401).json({ error: `unauthorized, your not logged in` });
      return;
    }

    const decoded = jwt.verify(token, ats) as JwtPayload | undefined;

    if (!decoded?.id) {
      res.status(403).json({ error: `forbidden: token invalid` });
      return;
    }

    const user = await Users.findById(decoded.id).select(["-__v", "-password"]);

    if (!user) {
      res.status(404).json({ error: `user not found` });
      return;
    }
    req.user = user as IUser;
    next();
  } catch (err) {
    if (err instanceof Error) {
      console.log(err);
      res.status(400).json({ error: err.message });
      return;
    }
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user.role !== "admin") return res.status(403).json({ error: `admin only` });
  next();
};
