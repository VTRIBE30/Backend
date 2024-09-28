const express = require("express");
const adminCategoryRouter = express.Router();
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const {
  authenticateAdmin,
} = require("../../middlewares/authenticationMiddleware");
const {
  createCategory,
  getTotalCommission,
  getDailyCommissionROI,
  getCategoryCommission,
} = require("../../controllers/admin/categoryController");

adminCategoryRouter.post("/create", authorizeUser, authenticateAdmin, createCategory);
adminCategoryRouter.get("/commission/total", authorizeUser, authenticateAdmin, getTotalCommission);
adminCategoryRouter.get("/commission/daily-roi", authorizeUser, authenticateAdmin, getDailyCommissionROI);
adminCategoryRouter.get("/commission/category/:categoryId", authorizeUser, authenticateAdmin, getCategoryCommission);

module.exports = adminCategoryRouter;
