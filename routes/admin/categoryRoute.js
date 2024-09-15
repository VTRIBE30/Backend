const express = require("express");
const adminCategoryRouter = express.Router();
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const {
  authenticateUser,
} = require("../../middlewares/authenticationMiddleware");
const {
  createCategory,
} = require("../../controllers/admin/categoryController");

adminCategoryRouter.post("/create", authorizeUser, authenticateUser, createCategory);

module.exports = adminCategoryRouter;
