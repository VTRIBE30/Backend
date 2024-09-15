const express = require("express");
const adminTransactionRouter = express.Router();
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const {
  authenticateAdmin,
} = require("../../middlewares/authenticationMiddleware");
const { getAllTransactions, getTotalSalesBalance } = require("../../controllers/admin/transactionsController");

adminTransactionRouter.get(
  "/all",
  authorizeUser,
  authenticateAdmin,
  getAllTransactions
);

adminTransactionRouter.get(
  "/total-payin",
  authorizeUser,
  authenticateAdmin,
  getTotalSalesBalance
);

module.exports = adminTransactionRouter;
