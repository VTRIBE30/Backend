const express = require("express");
const adminAccountRouter = express.Router();
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const {
  authenticateAdmin,
} = require("../../middlewares/authenticationMiddleware");
const { addSubAdmin, updateSubAdmin, disableSubAdmin } = require("../../controllers/admin/accountControler");

adminAccountRouter.post(
  "/sub-admin/add",
  authorizeUser,
  authenticateAdmin,
  addSubAdmin
);

adminAccountRouter.put(
  "/sub-admin/update/:adminId",
  authorizeUser,
  authenticateAdmin,
  updateSubAdmin
);

adminAccountRouter.put(
  "/sub-admin/disable/:adminId",
  authorizeUser,
  authenticateAdmin,
  disableSubAdmin
);

module.exports = adminAccountRouter;
