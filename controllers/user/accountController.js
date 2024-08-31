const { cloudinaryUserPfpUploader } = require("../../middlewares/cloudinary");
const User = require("../../models/user");
const Product = require("../../models/product");
const { validatePassword, generateHash } = require("../../utils/bcrypt");
const { formatWalletBalance } = require("../../utils/functions");
const {
  validateProfileUpdate,
  validateBusinessProfileUpdate,
  validatePasswordChange,
  addAddressValidation,
  editAddressValidation,
  deleteAddressValidation,
  vaidateProductId,
  validateInitiateFunding,
  validateVerifyFunding,
} = require("../../utils/validation");
const Notification = require("../../models/notification");
const axios = require("axios");
const Wallet = require("../../models/wallet");
const { sendNotification } = require("../../services/notification");
const Transaction = require("../../models/transaction");

// Initialize payment endpoint
exports.initializeFunding = async (req, res, next) => {
  try {
    const { error } = validateInitiateFunding(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        message: "Validation error",
        error: error.details[0].message,
      });
    }

    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: false, error: "User not found" });
    }

    const { amount } = req.body;

    // Convert the amount to kobo (smallest currency unit)
    const paystackAmount = amount * 100;

    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user?.email,
        amount: paystackAmount,
        metadata: {
          userId: userId,
          first_name: user?.firstName,
          last_name: user?.lastName,
          phone: user?.phoneNumber,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const templateData = {
      userId: user._id,
      title: "Wallet Funding",
      body: `You just initiated a wallet fund of ₦${amount}, Please complete your payment...`,
      type: "ACCOUNT_ACTIVITY",
    };

    await sendNotification(templateData, next);

    // Create transaction record
    const transaction = new Transaction({
      wallet: user.walletId,
      sender: user._id,
      recipient: user._id,
      amount: parseFloat(amount),
      transactionId: "VTRIBE_TX_" + paystackResponse.data.data.reference,
      transactionType: "Wallet Funding",
      description: "Funded wallet with paystack",
    });

    await transaction.save();

    // Send the authorization URL to the client
    res.status(200).json({
      status: true,
      message: "Payment initialized successfully",
      payment: {
        authorizationUrl: paystackResponse.data.data.authorization_url,
        reference: paystackResponse.data.data.reference,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Verify payment endpoint
exports.verifyFunding = async (req, res, next) => {
  try {
    // Validate request query parameters
    const { error } = validateVerifyFunding(req.query);
    if (error) {
      return res.status(400).json({
        status: false,
        message: "Validation error",
        error: error.details[0].message,
      });
    }

    const userId = req.user.userId;
    const { reference } = req.query;

    // Send verification request to Paystack
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    // Check if the response indicates a failed status
    if (!paystackResponse.data.status) {
      return res.status(400).json({
        status: false,
        message:
          paystackResponse.data.message || "Invalid transaction reference",
      });
    }

    const paymentData = paystackResponse.data.data;
    console.log(paymentData);

    // Check if the transaction was successful
    if (paymentData.status === "success") {
      // Find the wallet based on the userId stored in metadata
      const wallet = await Wallet.findOne({
        userId: paymentData?.metadata?.userId,
      });

      if (!wallet) {
        return res.status(404).json({
          status: false,
          message: "User wallet not found",
        });
      }

      const chargeAmount = 0.05; // Example charge rate
      const newAmount =
        parseFloat(paymentData.amount) / 100 -
        (parseFloat(paymentData.amount) / 100) * chargeAmount;
      wallet.balance += parseFloat(newAmount);
      await wallet.save();

      // Update the transaction record
      const transaction = await Transaction.findOneAndUpdate(
        { transactionId: new RegExp(`^VTRIBE_TX_${reference}$`, "i") },
        { transactionStatus: "Successful" },
        { new: true }
      );

      const templateData = {
        userId: userId,
        title: "Wallet Funding",
        body: `Your deposit of ₦${transaction.amount} was successful`,
        type: "ACCOUNT_ACTIVITY",
      };
  
      await sendNotification(templateData, next);

      return res.status(200).json({
        status: true,
        message: "Payment verified successfully",
        transaction,
      });
    } else {
      // Handle cases where the transaction status is not successful
      return res.status(400).json({
        status: false,
        message: "Payment not successful",
      });
    }
  } catch (error) {
    // Handle Axios errors specifically
    if (error.response) {
      const statusCode = error.response.status || 500;
      const errorMessage =
        error.response.data.message || "Error verifying payment";

      console.error("Error response from Paystack:", {
        status: statusCode,
        message: errorMessage,
        data: error.response.data,
      });

      return res.status(statusCode).json({
        status: false,
        message: errorMessage,
      });
    }

    // For unexpected errors, log and pass to the error middleware
    console.error("Unexpected error:", error);
    next(error);
  }
};

exports.getWalletBalance = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate("walletId");

    if (!user) {
      return res.status(404).json({ status: false, error: "User not found" });
    }

    const wallet = user.walletId;
    if (!wallet) {
      return res
        .status(404)
        .json({ status: false, error: "Wallet not found for this user" });
    }

    const formattedBalance = formatWalletBalance(wallet.balance);

    return res.status(200).json({ status: true, balance: formattedBalance });
  } catch (error) {
    next();
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId, { password: 0 });

    if (!user) {
      return res.status(404).json({ status: false, error: "User not found" });
    }

    return res.status(200).json({
      status: true,
      message: "User details retrieved successfully",
      user: {
        _id: user?._id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        phoneNumber: user?.phoneNumber,
        gender: user?.gender,
        dateOfBirth: user?.dateOfBirth,
        profilePic: user?.profilePic,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getBusinessProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId, { password: 0 });

    if (!user) {
      return res.status(404).json({ status: false, error: "User not found" });
    }

    return res.status(200).json({
      status: true,
      message: "User business details retrieved successfully",
      business: user.business,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updatedProfile = req.body;

    //   console.log("updatedProfile: ", updatedProfile);

    // Validate the input using Joi
    const { error } = validateProfileUpdate(updatedProfile);
    if (error) {
      return res.status(400).json({
        status: false,
        message: "Validation error",
        error: error.details[0].message,
      });
    }

    // If profilePic is included, handle Cloudinary upload
    if (req.file) {
      const imageFile = req.file.path;
      cloudinaryUserPfpUploader(imageFile, async (error, uploadedImageUrl) => {
        if (error) {
          console.error(error);
          return res.status(400).json({
            status: false,
            message: "You've got some errors",
            error: error?.message,
          });
        } else {
          // Update user's profilePic in the updatedProfile object
          // console.log(uploadedImageUrl);
          updatedProfile.profilePic = uploadedImageUrl.secure_url;

          // Update user profile
          const user = await User.findOneAndUpdate(
            { _id: userId },
            { $set: updatedProfile },
            { new: true }
          );

          if (!user) {
            return res.status(404).json({
              status: false,
              error: "User not found",
            });
          }

          return res.status(200).json({
            status: true,
            message: "Profile updated successfully",
          });
        }
      });
    } else {
      // If no profilePic, just update user profile
      const user = await User.findOneAndUpdate(
        { _id: userId },
        { $set: updatedProfile },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          status: false,
          error: "User not found",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Profile updated successfully",
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.updateBusinessProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updatedBusinessProfile = req.body;

    // Validate the input using Joi
    const { error } = validateBusinessProfileUpdate(updatedBusinessProfile);
    if (error) {
      return res.status(400).json({
        status: false,
        message: "Validation error",
        error: error.details[0].message,
      });
    }

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { business: updatedBusinessProfile } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        status: false,
        error: "User not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Business Profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.checkUserProfileCompletion = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId, { password: 0 });

    if (!user) {
      return res.status(404).json({ status: false, error: "User not found" });
    }

    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "gender",
      "dateOfBirth",
      "profilePic",
    ];

    const filledFields = requiredFields.filter((field) => user[field]);
    const completenessPercent = Math.round(
      (filledFields.length / requiredFields.length) * 100
    );
    const isComplete = completenessPercent === 100;

    return res.status(200).json({
      status: true,
      message: "Profile completeness checked successfully",
      profileCompleteness: {
        percent: completenessPercent,
        isComplete: isComplete,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    const { error } = validatePasswordChange({ oldPassword, newPassword });
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, error: "User not found" });
    }

    const isMatch = validatePassword(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: false, error: "Old password is incorrect" });
    }

    const hashedNewPassword = generateHash(newPassword);

    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.getDeliveryAddresses = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: false, error: "User not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Delivery Addresses retrieved successfully",
      deliveryAddresses: user.deliveryAddresses,
    });
  } catch (error) {
    next(error);
  }
};

exports.addDeliveryAddress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { error } = addAddressValidation(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    const { firstName, lastName, phoneNumber, street, city, state } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, error: "User not found" });
    }

    user.deliveryAddresses.push({
      firstName,
      lastName,
      phoneNumber,
      street,
      city,
      state,
    });
    await user.save();

    return res.status(201).json({
      status: true,
      message: "Delivery Address added successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.editDeliveryAddress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;
    const { error } = editAddressValidation({ addressId, ...req.body });
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    const { firstName, lastName, phoneNumber, street, city, state } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, error: "User not found" });
    }

    const address = user.deliveryAddresses.id(addressId);
    if (!address) {
      return res
        .status(404)
        .json({ status: false, error: "Delivery Address not found" });
    }

    address.firstName = firstName || address.firstName;
    address.lastName = lastName || address.lastName;
    address.phoneNumber = phoneNumber || address.phoneNumber;
    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;

    await user.save();

    return res.status(200).json({
      status: true,
      message: "Delivery Address updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteDeliveryAddress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { error } = deleteAddressValidation(req.params);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, error: "User not found" });
    }

    const address = user.deliveryAddresses.id(addressId);
    if (!address) {
      return res
        .status(404)
        .json({ status: false, error: "Delivery Address not found" });
    }

    address.deleteOne();
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Delivery Address deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.addProductToFavorites = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { error } = vaidateProductId(req.params);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }

    // Check if the user already has the product in their favorites
    const user = await User.findById(userId);
    if (user.favorites.includes(productId)) {
      return res.status(400).json({
        status: false,
        message: "Product is already in favorites",
      });
    }

    // Add the product to the user's favorites
    user.favorites.push(productId);
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Product added to favorites successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Find the user and populate the favorites field with product details
    const user = await User.findById(userId).populate("favorites");

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Favorites retrieved successfully",
      favorites: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ status: true, notifications });
  } catch (error) {
    next(error);
  }
};
