const express = require("express");
const feedRouter = express.Router();
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const {
  authenticateUser,
} = require("../../middlewares/authenticationMiddleware");

const upload = require("../../middlewares/upload");
const { createFeedPost, searchFeeds } = require("../../controllers/user/feedController");

feedRouter.post(
  "/create",
  authorizeUser,
  authenticateUser,
  upload.array("media"),
  createFeedPost
);

feedRouter.post(
  "/search",
  authorizeUser,
  authenticateUser,
  searchFeeds
);

module.exports = feedRouter;
