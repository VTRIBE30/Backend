const express = require("express");
const productRouter = express.Router();
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const {
  authenticateUser,
} = require("../../middlewares/authenticationMiddleware");
const { createProduct } = require("../../controllers/user/productController");
const upload = require("../../middlewares/upload");

productRouter.post(
  "/create",
  authorizeUser,
  authenticateUser,
  upload.any(),
  createProduct
);

module.exports = productRouter;
