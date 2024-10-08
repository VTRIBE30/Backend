const express = require("express");
const chatRouter = express.Router();
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const {
  authenticateUser,
} = require("../../middlewares/authenticationMiddleware");
const {
  startChat,
  getMessages,
  sendMessage,
  getRecentChats,
} = require("../../controllers/user/chatController");
const upload = require("../../middlewares/upload");

chatRouter.get("/recents", authorizeUser, authenticateUser, getRecentChats);

chatRouter.post("/start", authorizeUser, authenticateUser, startChat);

chatRouter.post(
  "/start/:chatId",
  authorizeUser,
  authenticateUser,
  upload.single("image"),
  sendMessage
);

chatRouter.get("/:chatId", authorizeUser, authenticateUser, getMessages);

module.exports = chatRouter;
