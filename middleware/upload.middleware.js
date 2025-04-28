import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    const uniquePreffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniquePreffix + file.originalname);
  },
});

export const upload = multer({ storage: storage });
