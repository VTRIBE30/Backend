const express = require("express");
const accountRouter = express.Router();
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const {
  getWalletBalance,
  getUserProfile,
  updateProfile,
} = require("../../controllers/user/accountController");
const {
  authenticateUser,
} = require("../../middlewares/authenticationMiddleware");
const upload = require("../../middlewares/upload");

accountRouter.get(
  "/wallet/balance",
  authorizeUser,
  authenticateUser,
  getWalletBalance
);

accountRouter.get(
  "/profile",
  authorizeUser,
  authenticateUser,
  getUserProfile
);

accountRouter.put(
  "/profile/update",
  authorizeUser,
  authenticateUser,
  upload.single("profilePic"),
  updateProfile
);

module.exports = accountRouter;
