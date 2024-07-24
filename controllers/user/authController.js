const Wallet = require("../../models/wallet");
const { generateHash, validatePassword } = require("../../utils/bcrypt");
const {
  validateSignUp,
  validateSignIn,
  validateEmailVerify,
  validateEmail,
  validateOtp,
  validateResetPassword,
} = require("../../utils/validation");
const { generateVerificationCode } = require("../../utils/verificationCode");
const JWT = require("../../utils/jwt");
const User = require("../../models/user");
const Token = require("../../models/token");
const {
  sendWelcomeEmail,
  sendOTPRequest,
  sendPasswordResetEmail,
} = require("../../services/email");

// Instatiating jwt helper
const jwt = new JWT();

exports.signUp = async (req, res, next) => {
  try {
    // Trim and convert email to lowercase before validating
    const trimmedBody = Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => {
        if (key === "email") {
          return [key, value?.trim().toLowerCase()]; // Added optional chaining here
        } else if (typeof value === "string") {
          return [key, value.trim()]; // Only trim if value is a string
        }
        return [key, value]; // Do not trim non-string values
      })
    );

    const { error } = validateSignUp(trimmedBody);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    const { email, password: req_password } = trimmedBody;
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return res.status(409).json({
        status: false,
        error: "User with this email already exists",
      });
    }

    const hashedPassword = generateHash(req_password);

    const generatedVerificationCode = generateVerificationCode();

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const wallet = new Wallet({
      userId: newUser._id,
      balance: 0,
    });

    const savedWallet = await wallet.save();

    newUser.walletId = savedWallet._id;

    const savedUser = await newUser.save();

    const verificationToken = new Token({
      user: savedUser._id,
      token: generatedVerificationCode,
    });
    const savedToken = await verificationToken.save();

    const templateData = {
      verificationCode: savedToken.token,
    };

    await sendWelcomeEmail(savedUser.email, templateData, next);

    const { password, ...others } = savedUser._doc;

    return res.status(201).json({
      status: true,
      message: "User registered successfully",
      token: others.token,
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    // Trim and convert email to lowercase before validating
    const trimmedBody = Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => {
        if (key === "email") {
          return [key, value?.trim().toLowerCase()];
        } else if (typeof value === "string") {
          return [key, value.trim()];
        }
        return [key, value];
      })
    );

    const { error } = validateEmailVerify(trimmedBody);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    const { email, verificationCode } = trimmedBody;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: false,
        error: "User not found.",
      });
    }

    // Find the token in the database and ensure it belongs to the user
    const verificationToken = await Token.findOne({
      user: user._id,
      token: verificationCode,
    });

    if (!verificationToken) {
      return res.status(404).json({
        status: false,
        error: "Invalid or expired token",
      });
    }

    // console.log(user);

    // Set the user as verified
    user.isEmailVerified = true;

    // console.log(user.isEmailVerified);
    const savedUser = await user.save();
    // console.log(savedUser);

    await verificationToken.deleteOne();

    return res.status(200).json({
      status: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    next(error);
  }
};

exports.signIn = async (req, res, next) => {
  try {
    const trimmedBody = Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => {
        if (key === "email") {
          return [key, value?.trim().toLowerCase()]; // Added optional chaining here
        } else if (typeof value === "string") {
          return [key, value.trim()]; // Only trim if value is a string
        }
        return [key, value]; // Do not trim non-string values
      })
    );

    const { error } = validateSignIn(trimmedBody);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }
    const { email, password } = trimmedBody;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: false,
        error: "Invalid email",
      });
    }
    if (!user.isEmailVerified) {
      return res.status(403).json({
        status: false,
        message: "Please verify your email before signing in",
      });
    }

    const isPasswordValid = validatePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: false,
        error: "Invalid password",
      });
    }

    const token = jwt.generateAccessToken(
      user._id,
      user.email,
      user.phoneNumber
    );

    // const templateData = {
    //   userId: user._id,
    //   title: "Security Alert",
    //   body: "We noticed a recent login to your account, if you were not the one, please reset your password",
    //   type: "SECURITY_ALERT",
    // };

    // await sendNotification(token, templateData);

    // await sendLoginAlert(user.email);

    return res.status(200).json({
      status: true,
      message: "Sign in successful",
      token,
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { error } = validateEmail(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }
    const { email } = req.body;
    const existingEmail = await User.findOne({ email });
    if (!existingEmail) {
      return res.status(400).json({
        status: false,
        error: "This email isn't registered yet",
      });
    }

    const generatedVerificationCode = generateVerificationCode();

    const verificationToken = new Token({
      user: existingEmail._id,
      token: generatedVerificationCode,
    });

    const savedToken = await verificationToken.save();

    const templateData = { verificationCode: savedToken.token };

    // Send the email otp
    await sendPasswordResetEmail(existingEmail.email, templateData);

    return res.status(201).json({
      status: true,
      message: "Password reset OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { error } = validateOtp(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details[0].message,
      });
    }
    const { verificationCode } = req.body;

    const passwordResetToken = await Token.findOne({
      token: verificationCode,
    });

    if (!passwordResetToken) {
      return res.status(400).json({
        status: false,
        error: "Invalid or expired token",
      });
    }

    const user = await User.findById(passwordResetToken.user);
    if (!user) {
      return res.status(404).json({
        status: false,
        error: "User not found",
      });
    }

    passwordResetToken.verified = true;
    await passwordResetToken.save();

    return res.status(200).json({
      status: true,
      message: "OTP verrified successful",
    });
  } catch (error) {
    next(error)
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { error } = validateResetPassword(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details[0].message,
      });
    }
    const { password, verificationCode } = req.body;

    const passwordResetToken = await Token.findOne({ token: verificationCode });
    // console.log(passwordResetToken);
    if (!passwordResetToken) {
      return res.status(400).json({
        status: false,
        error: "Invalid or expired token",
      });
    }

    if (passwordResetToken?.verified !== true) {
      return res.status(400).json({
        status: false,
        error: "Invalid or expired token",
      });
    }

    const user = await User.findById(passwordResetToken.user);
    if (!user) {
      return res.status(404).json({
        status: false,
        error: "User not found",
      });
    }

    const hashedPassword = generateHash(password);

    user.password = hashedPassword;
    await user.save();

    await passwordResetToken.deleteOne();

    return res.status(200).json({
      status: true,
      message: "Password reset successful",
    });
  } catch (error) {
    next()
  }
};

exports.sendOTP = async (req, res, next) => {
  try {
    const { error } = validateEmail(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }
    const { email } = req.body;
    const existingEmail = await User.findOne({ email });
    if (!existingEmail) {
      return res.status(400).json({
        status: false,
        error: "This email isn't registered yet",
      });
    }

    const generatedVerificationCode = generateVerificationCode();

    const verificationToken = new Token({
      user: existingEmail._id,
      token: generatedVerificationCode,
    });

    const savedToken = await verificationToken.save();

    const templateData = { verificationCode: savedToken.token };

    // Send the email otp
    await sendOTPRequest(existingEmail.email, templateData);

    return res.status(201).json({
      status: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};
