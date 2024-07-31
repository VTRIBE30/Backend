const express = require("express");
const categoryRouter = express.Router();
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const {
  authenticateUser,
} = require("../../middlewares/authenticationMiddleware");
const { getCategories } = require("../../controllers/user/categoryController");

categoryRouter.get("/all", authorizeUser, authenticateUser, getCategories);

module.exports = categoryRouter;
