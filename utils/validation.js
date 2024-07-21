const Joi = require("joi");
const { default: mongoose } = require("mongoose");

exports.validateSignUp = (details) => {
  const signUpSchema = Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().required(),
  });

  return signUpSchema.validate(details);
};

exports.validateEmailVerify = (details) => {
  const schema = Joi.object({
    email: Joi.string().trim().email().required(),
    verificationCode: Joi.string().trim().length(6).required(),
  });

  return schema.validate(details);
};

exports.validateSignIn = (details) => {
  const signInSchema = Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().required(),
  });

  return signInSchema.validate(details);
};

exports.validatePhoneVerification = (details) => {
  const verificationSchema = Joi.object({
    verificationCode: Joi.string().required(),
    phoneNumber: Joi.string()
      .trim()
      .regex(/^\+[0-9]+$/)
      .required(),
  });

  return verificationSchema.validate(details);
};

exports.validateEmail = (details) => {
  const schema = Joi.object({
    email: Joi.string().trim().email().required(),
  });

  return schema.validate(details);
};

exports.validateOtp = (details) => {
  const otpSchema = Joi.object({
    verificationCode: Joi.string().trim().length(6).required(),
  });

  return otpSchema.validate(details);
};

exports.validateResetPassword = (details) => {
  const resetPasswordSchema = Joi.object({
    password: Joi.string().required(),
    verificationCode: Joi.string().trim().length(6).required(),
  });

  return resetPasswordSchema.validate(details);
};

exports.validateSingleRecipientDetails = (details) => {
  const singleRecipientSchema = Joi.object({
    recipient: Joi.string().required(),
  });

  return singleRecipientSchema.validate(details);
};

exports.validateRecipientDetails = (details) => {
  const recipientSchema = Joi.object({
    recipients: Joi.array()
      .items(
        Joi.object({
          phoneNumber: Joi.string().required(),
        })
      )
      .min(1)
      .required(),
  });

  return recipientSchema.validate(details);
};

exports.validateSinglePaymentDetails = (details) => {
  // Joi schema for payment details validation
  const paymentSchema = Joi.object({
    email: Joi.string().required(),
    purpose: Joi.string().required(),
    amount: Joi.number().positive().greater(0.5).required(),
    passcode: Joi.string().required(),
    saveAsBeneficiary: Joi.boolean().required(),
  });
  return paymentSchema.validate(details);
};

exports.validateNonUserRecipientDetails = (details) => {
  // Joi schema for payment details validation
  const paymentSchema = Joi.object({
    recipient: Joi.string().required(),
    amount: Joi.number().positive().greater(0.5).required(),
    passcode: Joi.string().required(),
  });
  return paymentSchema.validate(details);
};

exports.validateMultiplePaymentDetails = (details) => {
  // Joi schema for payment details validation
  const paymentSchema = Joi.object({
    amounts: Joi.array()
      .items(
        Joi.object({
          phoneNumber: Joi.string().required(),
          purpose: Joi.string().required(),
          amount: Joi.number().positive().greater(0.5).required(),
        })
      )
      .min(1)
      .required(),
  });

  return paymentSchema.validate(details);
};

exports.validateFundLoadingDetails = (details) => {
  // Joi schema for fund loading validation
  const paymentIntentSchema = Joi.object({
    amount: Joi.number().positive().greater(0.5).required(),
  });

  return paymentIntentSchema.validate(details);
};

exports.validatePaymentRequestDetails = (details) => {
  const paymentRequestSchema = Joi.object({
    amount: Joi.number().positive().greater(0.5).required(),
    description: Joi.string().required(),
    duedate: Joi.date().required(),
    recipients: Joi.array().required(),
  });

  return paymentRequestSchema.validate(details);
};

exports.validateLinkToken = (details) => {
  const linkTokenRequestSchema = Joi.object({
    linkToken: Joi.string().required(),
  });

  return linkTokenRequestSchema.validate(details);
};

exports.validatePublicToken = (details) => {
  const publicTokenExchangeSchema = Joi.object({
    publicToken: Joi.string().required(),
  });

  return publicTokenExchangeSchema.validate(details);
};

exports.validateTransferAuthorization = (details) => {
  const transferAuthorizationSchema = Joi.object({
    accessToken: Joi.string().required(),
    accountId: Joi.string().required(),
    amount: Joi.number().positive().greater(0.5).required(),
  });

  return transferAuthorizationSchema.validate(details);
};

exports.authorization_id = (details) => {
  const createTransferSchema = Joi.object({
    accessToken: Joi.string().required(),
    accountId: Joi.string().required(),
    authorizationId: Joi.string().required(),
    amount: Joi.number().positive().greater(0.5).required(),
    description: Joi.string().required(),
  });

  return createTransferSchema.validate(details);
};

exports.validateBeneficiary = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    profilePic: Joi.string().uri().required(),
  });

  return schema.validate(data, { abortEarly: false });
};

exports.validateCard = (data) => {
  const saveCardSchema = Joi.object({
    cardToken: Joi.string().required(),
    customerId: Joi.string().optional(),
  });

  return saveCardSchema.validate(data, { abortEarly: false });
};

exports.validateCardRetrieve = (data) => {
  const getSavedCardsSchema = Joi.object({
    customerId: Joi.string().required(),
  });

  return getSavedCardsSchema.validate(data, { abortEarly: false });
};

exports.validateContactDetails = (data) => {
  const contactSchema = Joi.object({
    fullName: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    message: Joi.string().required(),
  });

  return contactSchema.validate(data, { abortEarly: false });
};

exports.validateLoginPasscode = (data) => {
  const loginPasscodeSchema = Joi.object({
    loginPasscode: Joi.string()
      .pattern(/^\d{6}$/)
      .required(),
  });

  return loginPasscodeSchema.validate(data, { abortEarly: false });
};

exports.validateBusinessSignUp = (details) => {
  const BusinessSignUpSchema = Joi.object({
    businessName: Joi.string().trim().required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().required(),
    cpassword: Joi.string().trim().required(),
    phoneNumber: Joi.string()
      .trim()
      .regex(/^\+[0-9]+$/)
      .required(),
    device: Joi.object({
      model: Joi.string().trim().required(),
      deviceId: Joi.string().trim().required(),
    }).required(),
  });

  return BusinessSignUpSchema.validate(details);
};

exports.validateBusinessSignIn = (details) => {
  const BusinessSignInSchema = Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().required(),
  });

  return BusinessSignInSchema.validate(details);
};

exports.validateBusinessSearchQuery = (details) => {
  const BusinessSearchQuery = Joi.object({
    search_query: Joi.string().required(),
  });

  return BusinessSearchQuery.validate(details);
};

exports.validateGetBusinesses = (details) => {
  const GetBusinesses = Joi.object({
    page: Joi.number().required(),
    limit: Joi.number().required(),
  });

  return GetBusinesses.validate(details);
};

exports.validateBusinessId = (details) => {
  const schema = Joi.object({
    businessId: Joi.string()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.message("Invalid business ID");
        }
        return value;
      })
      .required(),
  });
  return schema.validate(details);
};

exports.validateAddNewBill = (details) => {
  const addNewBill = Joi.object({
    description: Joi.string().required(),
    totalAmount: Joi.number().positive().greater(0.5).required(),
    dueDate: Joi.string().required(),
    participants: Joi.array()
      .items(
        Joi.object({
          firstName: Joi.string().required(),
          lastName: Joi.string().required(),
          email: Joi.string().required(),
          amount: Joi.number().positive().greater(0.5).required(),
        })
      )
      .min(1)
      .required(),
  });

  return addNewBill.validate(details);
};

exports.validatePayBusinessWithWallet = (details) => {
  const schema = Joi.object({
    companyId: Joi.string()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.message("Invalid business ID");
        }
        return value;
      })
      .required(),
    amount: Joi.number().positive().greater(0.5).required(),
    note: Joi.string().required(),
    transactionPin: Joi.string().required(),
  });

  return schema.validate(details);
};
