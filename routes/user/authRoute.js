const express = require("express");
const authRouter = express.Router(); 
const authController = require("../../controllers/user/authController");
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
// const { loginLimiter } = require("../../middlewares/rateLimiter");

authRouter.post("/register", authorizeUser, authController.signUp);
authRouter.post("/verify-email", authorizeUser, authController.verifyEmail);
authRouter.post("/login", authorizeUser, authController.signIn);
authRouter.post("/verify-otp", authorizeUser, authController.verifyOtp);
authRouter.post("/forgot-password", authorizeUser, authController.forgotPassword);
authRouter.post("/reset-password", authorizeUser, authController.resetPassword);
authRouter.post("/send-otp", authorizeUser, authController.sendOTP);

module.exports = authRouter;
