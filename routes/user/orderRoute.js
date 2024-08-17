const express = require("express");
const orderRouter = express.Router();
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const {
  authenticateUser,
} = require("../../middlewares/authenticationMiddleware");
const {
  placeOrder,
  getOrderDetails,
  getUserOrders,
  getOrdersByStatus,
  makeOffer,
  respondToOffer,
  getOffersMadeByUser,
  getOffersOnUserProducts,
} = require("../../controllers/user/orderController");

orderRouter.post(
  "/offer/:productId",
  authorizeUser,
  authenticateUser,
  makeOffer
);

orderRouter.put(
  "/offer/respond/:offerId",
  authorizeUser,
  authenticateUser,
  respondToOffer
);

orderRouter.get(
  "/offer/all",
  authorizeUser,
  authenticateUser,
  getOffersMadeByUser
);

orderRouter.get(
  "/offer/product/all",
  authorizeUser,
  authenticateUser,
  getOffersOnUserProducts
);

orderRouter.post("/place", authorizeUser, authenticateUser, placeOrder);

orderRouter.get(
  "/details/:orderId",
  authorizeUser,
  authenticateUser,
  getOrderDetails
);

orderRouter.get("/all", authorizeUser, authenticateUser, getUserOrders);

orderRouter.get(
  "/all/status/:status",
  authorizeUser,
  authenticateUser,
  getOrdersByStatus
);

module.exports = orderRouter;
