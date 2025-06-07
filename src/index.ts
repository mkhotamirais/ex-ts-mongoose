import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import db from "./config";
import { corsOptions, credentials } from "./middleware";
import path from "path";

const dirName = path.resolve();

import router from "./app/router";

const app = express();
const port = process.env.PORT || 3000;

app.use(credentials); // --- built-in middleware
app.use(cors(corsOptions)); // mw for 'content-type: application/x-www-form-urlencoded' / form data
app.use(express.json()); // mw for json
app.use(express.static(path.join(dirName, "public"))); // mw for serve static file (ex: public)
app.use(express.urlencoded({ extended: true })); // mw for cookies
app.use(cookieParser()); // mw for cookiescookieParser());

app.get("/", (req, res) => {
  res.status(200).sendFile(path.join(dirName, "src/views", "index.html"));
});

app.use("/api", router);

app.use((req: Request, res: Response) => {
  res.status(404);
  res.sendFile(path.join(dirName, "src/views", "404.html"));
  if (req.accepts("html")) res.sendFile(path.join(dirName, "src/views", "404.html"));
  if (req.accepts("json")) res.json({ message: "404 Not Found" });
  else res.type("txt").send("404 Not Found");
});

db.then(() => {
  console.log("Connected to MongoDB");
  app.listen(port, () => {
    console.log(`Server running in development mode at http://localhost:${port}`);
  });
}).catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
});

// ----- ROUTES
// app.get("^/$|/index(.html)?", (req, res) => {
//   // res.sendFile("./views/index.html", { root: dirName });
//   res.sendFile(path.join(dirName, "views", "index.html"));
// });
// app.get("/newpage(.html)?", (req, res) => {
//   res.sendFile(path.join(dirName, "views", "new-page.html"));
// });
// app.get("/oldpage(.html)?", (req, res) => {
//   res.redirect(301, "/newpage");
// });
// app.get("/subdir-page", (req, res) => {
//   res.sendFile(path.join(dirName, "views", "subdir", "index.html"));
// });

// ----- CUSTOM MIDDLEWARE
// const mw1 = (req, res, next) => {
//   req.nama = "ahmad";
//   next();
// };
// const mw2 = (req, res, next) => {
//   req.nama = "abdul";
//   req.umur = 20;
//   console.log(req.umur);
//   next();
// };
// app.use(mw1);
// app.use("/mw-a", mw2, (req, res) => {
//   res.json({
//     nama: req.nama,
//     message: "middleware mw1 dijalankan di semua endpoin di bawahnya, sedangkan mw2 hanya dijalankan di endpoin /mw-a",
//   });
// });
// app.use("/mw-b", (req, res) => {
//   res.json({ nama: req.nama });
// });

// ----- CONNECTION
// mongoose.connection.once("open", () => {
//   app.listen(port, () => log(`Server connected to mongodb and running on port ${port}`));
// });

// mongoose.connection.on("error", (error) => {
//   // logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, "mongoErrLog.log");
//   console.log(error);
// });

// Status Code
// 200: ok
// 201: created
// 204: no content
// 400: bad request
// 401: unauthorized
// 403: forbidden
// 409: conflict
// 500: internal server error
