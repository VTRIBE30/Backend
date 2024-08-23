const express = require("express");
const feedRouter = express.Router();
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const {
  authenticateUser,
} = require("../../middlewares/authenticationMiddleware");

const upload = require("../../middlewares/upload");
const { createFeedPost, searchFeeds, getFeedPosts, likeFeedPost, addCommentToFeedPost, likeCommentPost, fetchFeedPost, bookmarkFeedPost, getCommentsForFeedPost } = require("../../controllers/user/feedController");

feedRouter.post(
  "/create",
  authorizeUser,
  authenticateUser,
  upload.array("media"),
  createFeedPost
);

feedRouter.get(
  "/all",
  authorizeUser,
  authenticateUser,
  getFeedPosts
);

feedRouter.get(
  "/search",
  authorizeUser,
  authenticateUser,
  searchFeeds
);

feedRouter.post(
  "/like/:feedPostId",
  authorizeUser,
  authenticateUser,
  likeFeedPost
);

feedRouter.post(
  "/bookmark/:feedPostId",
  authorizeUser,
  authenticateUser,
  bookmarkFeedPost
);

feedRouter.post(
  "/comment/:feedPostId",
  authorizeUser,
  authenticateUser,
  addCommentToFeedPost
);

feedRouter.post(
  "/comment/like/:commentId",
  authorizeUser,
  authenticateUser,
  likeCommentPost
);

feedRouter.get(
  "/:feedPostId",
  authorizeUser,
  authenticateUser,
  fetchFeedPost
);

feedRouter.get(
  "/:feedPostId/comment/all",
  authorizeUser,
  authenticateUser,
  getCommentsForFeedPost
);

module.exports = feedRouter;
