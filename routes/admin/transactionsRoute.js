const express = require("express");
const adminTransactionRouter = express.Router();
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const {
  authenticateAdmin,
} = require("../../middlewares/authenticationMiddleware");
const { getAllTransactions, getTotalSalesBalance, getTotalSalesPayOut, getRoi, getSalesComparison, getPendingTransactionsCount, getTransactionChartData } = require("../../controllers/admin/transactionsController");

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

adminTransactionRouter.get(
  "/total-payout",
  authorizeUser,
  authenticateAdmin,
  getTotalSalesPayOut
);

adminTransactionRouter.get(
  "/roi",
  authorizeUser,
  authenticateAdmin,
  getRoi
);

adminTransactionRouter.get(
  "/sales-compare",
  authorizeUser,
  authenticateAdmin,
  getSalesComparison
);

adminTransactionRouter.get(
  "/pending/count",
  authorizeUser,
  authenticateAdmin,
  getPendingTransactionsCount
);

adminTransactionRouter.get(
  "/chart-data",
  authorizeUser,
  authenticateAdmin,
  getTransactionChartData
);

module.exports = adminTransactionRouter;
