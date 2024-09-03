const multer = require("multer");

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    return cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 },
});

module.exports = upload;
