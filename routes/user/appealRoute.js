const express = require("express");
const appealRouter = express.Router();
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const { createAppeal } = require("../../controllers/user/appealController");
const {
  authenticateUser,
} = require("../../middlewares/authenticationMiddleware");
const upload = require("../../middlewares/upload");

appealRouter.post(
  "/create",
  authorizeUser,
  authenticateUser,
  upload.array("images"),
  createAppeal
);

module.exports = appealRouter;
