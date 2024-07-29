const express = require("express");
const accountRouter = express.Router();
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const {
  getWalletBalance,
  getUserProfile,
  updateProfile,
  getBusinessProfile,
  updateBusinessProfile,
  checkUserProfileCompletion,
  changePassword,
  addDeliveryAddress,
  editDeliveryAddress,
  deleteDeliveryAddress,
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

accountRouter.get("/profile", authorizeUser, authenticateUser, getUserProfile);

accountRouter.get(
  "/profile/completion",
  authorizeUser,
  authenticateUser,
  checkUserProfileCompletion
);

accountRouter.get(
  "/business/profile",
  authorizeUser,
  authenticateUser,
  getBusinessProfile
);

accountRouter.put(
  "/profile/update",
  authorizeUser,
  authenticateUser,
  upload.single("profilePic"),
  updateProfile
);

accountRouter.put(
  "/business/profile/update",
  authorizeUser,
  authenticateUser,
  updateBusinessProfile
);

accountRouter.post(
  "/password/change",
  authorizeUser,
  authenticateUser,
  changePassword
);

accountRouter.post(
  "/deliveryAddress/add",
  authorizeUser,
  authenticateUser,
  addDeliveryAddress
);
accountRouter.put(
  "/delieveryAddress/edit",
  authorizeUser,
  authenticateUser,
  editDeliveryAddress
);
accountRouter.delete(
  "/delieveryAddress/delete",
  authorizeUser,
  authenticateUser,
  deleteDeliveryAddress
);

module.exports = accountRouter;
