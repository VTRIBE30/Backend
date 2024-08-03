const express = require("express");
const categoryRouter = express.Router();
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const {
  authenticateUser,
} = require("../../middlewares/authenticationMiddleware");
const { getCategories, getSubcategoriesByCategory } = require("../../controllers/user/categoryController");

categoryRouter.get("/all", authorizeUser, authenticateUser, getCategories);
categoryRouter.get("/:categoryId/subcategories", authorizeUser, authenticateUser, getSubcategoriesByCategory);

module.exports = categoryRouter;
