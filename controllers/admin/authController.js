const Admin = require("../../models/admin");
const bcrypt = require("bcrypt");
const { validateSignUp, validateSignIn, validateSubAdminSignUp } = require("../../utils/validation");
const { generateHash, validatePassword } = require("../../utils/bcrypt");
const JWT = require("../../utils/jwt");

// Instatiating jwt helper
const jwt = new JWT();

exports.signUpAdmin = async (req, res, next) => {
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
    const existingEmailUser = await Admin.findOne({ email });
    if (existingEmailUser) {
      return res.status(409).json({
        status: false,
        error: "User with this email already exists",
      });
    }

    const hashedPassword = generateHash(req_password);

    const newAdmin = new Admin({
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    return res.status(201).json({
      status: true,
      message: "Super admin registered successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.signInAdmin = async (req, res, next) => {
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
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        status: false,
        error: "Invalid email",
      });
    }

    const isPasswordValid = validatePassword(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: false,
        error: "Invalid password",
      });
    }

    const token = jwt.generateAdminAccessToken(
      admin._id,
      admin.email,
      admin.role
    );

    // const templateData = {
    //   userId: user._id,
    //   title: "Security Alert",
    //   body: "We noticed a recent login to your account, if you were not the one, please reset your password",
    //   type: "SECURITY_ALERT",
    // };

    // await sendNotification(templateData, next);

    // await sendLoginAlert(user.email);

    return res.status(200).json({
      status: true,
      message: "Admin Sign in successful",
      token,
    });
  } catch (error) {
    next(error);
  }
};
