const express = require("express");
const appealRouter = express.Router();
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const { createAppeal } = require("../../controllers/user/appealController");
const {
  authenticateUser,
} = require("../../middlewares/authenticationMiddleware");

appealRouter.post("/create", authorizeUser, authenticateUser, createAppeal);

module.exports = appealRouter;
