import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import url from "url";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

const ats = process.env.ACCESS_TOKEN_SECRET;
const rts = process.env.REFRESH_TOKEN_SECRET;

const data = {
  users: JSON.parse(fs.readFileSync(new URL("./user.json", import.meta.url))),
  setUsers(data) {
    this.users = data;
  },
};

export const signup = (req, res) => {
  const { username, email, password, confPassword } = req.body;
  if (!username) return res.status(400).json({ error: "username is required" });
  if (!email) return res.status(400).json({ error: "email is required" });
  if (!password) return res.status(400).json({ error: "password is required" });
  const dupEmail = data.users.find((u) => u.email === email);
  if (dupEmail) return res.status(409).json({ error: "duplicate email" });
  if (password !== confPassword) return res.status(400).json({ error: "confirm password wrong" });
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    req.body.id = uuidv4();
    req.body.password = hash;
    req.body.createdAt = new Date().toISOString();
    req.body.updatedAt = new Date().toISOString();
    req.body.role = "user";
    const { confPassword, ...newUser } = req.body;
    data.setUsers([...data.users, newUser]);
    fs.writeFileSync(
      path.join(path.dirname(url.fileURLToPath(import.meta.url)), "user.json"),
      JSON.stringify(data.users)
    );
    res.status(201).json({ message: `register ${username} success` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const signin = (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ error: "email is required" });
  if (!password) return res.status(400).json({ error: "password is required" });
  const matchEmail = data.users.find((u) => u.email === email);
  if (!matchEmail) return res.status(401).json({ error: "unauthorized, not registered" });
  const matchPwd = bcrypt.compareSync(password, matchEmail.password);
  if (!matchPwd) return res.status(401).json({ error: "unauthorized, not registered" });
  const accessToken = jwt.sign({ email: matchEmail.email, role: matchEmail.role }, ats, { expiresIn: "20s" });
  const refreshToken = jwt.sign({ email: matchEmail.email, role: matchEmail.role }, rts, { expiresIn: "1d" });
  const otherData = data.users.filter((u) => u.email !== email);
  const currentData = { ...matchEmail, refreshToken };
  data.setUsers([...otherData, currentData]);
  fs.writeFileSync(
    path.join(path.dirname(url.fileURLToPath(import.meta.url)), "user.json"),
    JSON.stringify(data.users)
  );
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "none",
    secure: true,
  });
  res.json({ accessToken });
};

export const refresh = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "no token" });
  const match = data.users.find((u) => u.refreshToken === refreshToken);
  if (!match) return res.status(403).json({ error: "forbidden, access denied" });
  jwt.verify(refreshToken, rts, (err, decoded) => {
    if (err || match.email !== decoded.email) return res.status(403).json({ error: "forbidden, access denied" });
    const accessToken = jwt.sign({ email: decoded.email, role: decoded.role }, ats, { expiresIn: "20s" });
    res.json({ accessToken });
  });
};

export const signout = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "no token" });
  const match = data.users.find((u) => u.refreshToken === refreshToken);
  if (!match) {
    res.clearCookie("refreshToken", { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: "None", secure: true });
    return noContent(res);
  }
  const otherUsers = data.users.filter((user) => user.refreshToken !== match.refreshToken);
  const currentUser = { ...match, refreshToken: "" };
  data.setUsers([...otherUsers, currentUser]);
  fs.writeFileSync(path.join(__dirname, "../v0user", "user.json"), JSON.stringify(data.users));
  res.clearCookie("refreshToken", { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: "None", secure: true });
  return noContent(res);
};
