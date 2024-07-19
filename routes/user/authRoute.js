const express = require("express");
const authRouter = express.Router(); 
const { authorizeUser } = require("../../middlewares/apiKeyValidator");
const { signUp, verifyEmail, signIn, verifyOtp, forgotPassword, resetPassword, sendOTP } = require("../../controllers/user/authController");
// const { loginLimiter } = require("../../middlewares/rateLimiter");

authRouter.post("/register", authorizeUser, signUp);
authRouter.post("/verify-email", authorizeUser, verifyEmail);
authRouter.post("/login", authorizeUser, signIn);
authRouter.post("/verify-otp", authorizeUser, verifyOtp);
authRouter.post("/forgot-password", authorizeUser, forgotPassword);
authRouter.post("/reset-password", authorizeUser, resetPassword);
authRouter.post("/send-otp", authorizeUser, sendOTP);

module.exports = authRouter;
