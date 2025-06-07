import multer from "multer";

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Nama file yang unik
  },
});

const upload = multer({ storage });

export default upload.single("image");

// import multer from "multer";
// import { resolve } from "path";
// import { rootPath } from "../config/constants.js";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, resolve(rootPath, "public/images/v5product"));
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname); // Nama file yang unik
//   },
// });

// const upload = multer({ storage });

// export default upload.single("image");
