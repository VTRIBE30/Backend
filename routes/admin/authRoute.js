const express = require("express");
const adminAuthRouter = express.Router();
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const {
  authenticateUser,
} = require("../../middlewares/authenticationMiddleware");
const { signUpAdmin, signInAdmin } = require("../../controllers/admin/authController");

adminAuthRouter.post("/register", authorizeUser, authenticateUser, signUpAdmin);
adminAuthRouter.post("/login", authorizeUser, authenticateUser, signInAdmin);

module.exports = adminAuthRouter;
