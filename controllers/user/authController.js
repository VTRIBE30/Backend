const Wallet = require("../../models/wallet");
const { generateHash, validatePassword } = require("../../utils/bcrypt");
const { validateSignUp, validateSignIn } = require("../../utils/validation");
const { generateVerificationCode } = require("../../utils/verificationCode");
const JWT = require("../../utils/jwt");
const User = require("../../models/user");
const Token = require("../../models/token");
const { sendWelcomeEmail } = require("../../services/email");

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
      verificationCode: savedToken.token
    }

    await sendWelcomeEmail(savedUser.email, templateData, next);

    const { password, ...others } = savedUser._doc;

    return res.status(201).json({
      status: true,
      message: "User registered successfully",
      token: others.token,
    });
  } catch (err) {
    next(err)
  }
};

exports.verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;
  if (!email || !verificationCode) {
    return res.status(400).json({
      status: false,
      error: "All fields are required",
    });
  } else {
    try {
      // Find the token in the database
      const verificationToken = await Token.findOne({
        token: verificationCode,
      });
      console.log(verificationToken);
      if (!verificationToken) {
        return res.status(404).json({
          status: false,
          error: "Invalid or expired token",
        });
      }

      // Find the associated user
      const user = await User.findById(verificationToken.user);
      console.log(user);
      if (!user) {
        return res.status(404).json({
          status: false,
          error: "User not found.",
        });
      }

      // Set the user as verified
      user.isVerified = true;
      await user.save();

      await verificationToken.deleteOne();

      return res.status(200).json({
        status: true,
        message: "Email verified successfully.",
      });
    } catch (error) {
      console.error("Error in verifyEmail:", error);
      return res.status(500).json({
        staus: false,
        error: "An error occurred while verifying the email.",
      });
    }
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
    next(error)
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const clientURL = getClientURL(req);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: false,
        error: "User not found",
      });
    }

    const generatedPasswordResetCode = generateVerificationCode();
    console.log(generatedPasswordResetCode);

    const passwordResetToken = new Token({
      user: user._id,
      token: generatedPasswordResetCode,
    });
    await passwordResetToken.save();

    sendPasswordResetEmail(user.email, generatedPasswordResetCode, clientURL);

    return res.status(200).json({
      status: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return res.status(500).json({
      status: false,
      error: "Internal server error",
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { verificationCode } = req.body;

    const { error } = validateOtp(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details[0].message,
      });
    }
    const passwordResetToken = await Token.findOne({ token: verificationCode });
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
    console.error("Error verifying OTP:", error);
    return res.status(500).json({
      status: false,
      error: "Internal server error",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, verificationCode } = req.body;

    const { error } = validateResetPassword(req.body);

    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details[0].message,
      });
    }
    const passwordResetToken = await Token.findOne({ token: verificationCode });
    console.log(passwordResetToken);
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

    const templateData = {
      userId: user?._id,
      title: "Security Alert",
      body: "Your password was changed if you didn't do this contact us immediately",
      type: "SECURITY_ALERT",
    };

    let deviceToken = "";

    await sendNotification(deviceToken, templateData);

    return res.status(200).json({
      status: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({
      status: false,
      error: "Internal server error",
    });
  }
};

exports.sendOTP = async (req, res) => {
  try {
    const { error } = validatePhone(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }
    const { phoneNumber } = req.body;
    const existingPhoneUser = await User.findOne({ phoneNumber });
    if (!existingPhoneUser) {
      return res.status(400).json({
        status: false,
        error: "This phone number isn't registered yet",
      });
    }

    const generatedVerificationCode = generateVerificationCode();

    const verificationToken = new Token({
      user: existingPhoneUser._id,
      token: generatedVerificationCode,
    });

    const savedToken = await verificationToken.save();

    // Send the verification sms
    await sendVerificationSms(existingPhoneUser.phoneNumber, savedToken.token);

    return res.status(201).json({
      status: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error in sending OTP:", error);
    return res.status(500).json({
      status: false,
      error: "An error occurred while sending the OTP",
    });
  }
};
