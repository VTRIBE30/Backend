const express = require("express");
const chatRouter = express.Router();
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const {
  authenticateUser,
} = require("../../middlewares/authenticationMiddleware");
const { startChat, getMessages, sendMessage } = require("../../controllers/user/chatController");

chatRouter.post(
  "/start",
  authorizeUser,
  authenticateUser,
  startChat
);

chatRouter.post(
  "/start/:chatId",
  authorizeUser,
  authenticateUser,
  sendMessage
);

chatRouter.get(
  "/:chatId",
  authorizeUser,
  authenticateUser,
  getMessages
);

module.exports = chatRouter;
