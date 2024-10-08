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
  getDeliveryAddresses,
  getFavorites,
  addProductToFavorites,
  getNotifications,
  initializeFunding,
  verifyFunding,
  retrieveTransactionDetails,
  fetchTransactionHistory,
  getUserRatingsAndReviews,
} = require("../../controllers/user/accountController");
const {
  authenticateUser,
} = require("../../middlewares/authenticationMiddleware");
const upload = require("../../middlewares/upload");

accountRouter.post(
  "/wallet/fund/initiate",
  authorizeUser,
  authenticateUser,
  initializeFunding
);

accountRouter.post(
  "/wallet/fund/verify",
  authorizeUser,
  authenticateUser,
  verifyFunding
);

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

accountRouter.get(
  "/deliveryAddress",
  authorizeUser,
  authenticateUser,
  getDeliveryAddresses
);

accountRouter.post(
  "/deliveryAddress/add",
  authorizeUser,
  authenticateUser,
  addDeliveryAddress
);

accountRouter.put(
  "/deliveryAddress/edit/:addressId",
  authorizeUser,
  authenticateUser,
  editDeliveryAddress
);

accountRouter.delete(
  "/deliveryAddress/delete/:addressId",
  authorizeUser,
  authenticateUser,
  deleteDeliveryAddress
);

accountRouter.post(
  "/favourite/:productId",
  authorizeUser,
  authenticateUser,
  addProductToFavorites
);

accountRouter.get(
  "/favourite/all",
  authorizeUser,
  authenticateUser,
  getFavorites
);

accountRouter.get(
  "/notifications/all",
  authorizeUser,
  authenticateUser,
  getNotifications
);

accountRouter.get(
  "/transactions/all/:userId",
  authorizeUser,
  authenticateUser,
  fetchTransactionHistory
);

accountRouter.get(
  "/transactions/:transactionId",
  authorizeUser,
  authenticateUser,
  retrieveTransactionDetails
);

accountRouter.get(
  "/reviews/:sellerId",
  authorizeUser,
  authenticateUser,
  getUserRatingsAndReviews
);

module.exports = accountRouter;
