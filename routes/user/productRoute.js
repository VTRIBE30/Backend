const express = require("express");
const productRouter = express.Router();
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const {
  authenticateUser,
} = require("../../middlewares/authenticationMiddleware");
const {
  createProduct,
  getAllProducts,
  getProductsByCategory,
  getProductsBySubcategory,
  searchProducts,
  getProductDetails,
  flagProduct,
  getProductsByStatus,
  getUserPostedProducts,
  addReview,
  getReviews,
} = require("../../controllers/user/productController");
const upload = require("../../middlewares/upload");

productRouter.post(
  "/create",
  authorizeUser,
  authenticateUser,
  upload.any(),
  createProduct
);

productRouter.get("/all", authorizeUser, authenticateUser, getAllProducts);

productRouter.get(
  "/category/:categoryId",
  authorizeUser,
  authenticateUser,
  getProductsByCategory
);

productRouter.get(
  "/subcategory/:subCategory",
  authorizeUser,
  authenticateUser,
  getProductsBySubcategory
);

productRouter.get("/search", authorizeUser, authenticateUser, searchProducts);

productRouter.get(
  "/:productId",
  authorizeUser,
  authenticateUser,
  getProductDetails
);

productRouter.post(
  "/:productId/flag",
  authorizeUser,
  authenticateUser,
  flagProduct
);

productRouter.get(
  "/status/:status",
  authorizeUser,
  authenticateUser,
  getProductsByStatus
);

productRouter.get(
  "/status/:status",
  authorizeUser,
  authenticateUser,
  getProductsByStatus
);

productRouter.get(
  "/status/:status",
  authorizeUser,
  authenticateUser,
  getProductsByStatus
);

productRouter.get(
  "/personal/all",
  authorizeUser,
  authenticateUser,
  getUserPostedProducts
);

productRouter.post(
  "/reviews/add/:productId", 
  authorizeUser, 
  authenticateUser, 
  addReview
);

productRouter.get(
  "/reviews/all", 
  authorizeUser, 
  authenticateUser, 
  getReviews
);

module.exports = productRouter;
