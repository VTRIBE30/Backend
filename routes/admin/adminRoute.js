const express = require("express");
const adminRouter = express.Router();
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const {
  authenticateUser,
} = require("../../middlewares/authenticationMiddleware");
const {
  createCategory,
} = require("../../controllers/admin/categoryController");

adminRouter.post("/create", authorizeUser, authenticateUser, createCategory);

module.exports = adminRouter;
