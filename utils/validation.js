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

exports.validateProfileUpdate = (details) => {
  const schema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
    gender: Joi.string().valid("Male", "Female").optional(),
  });

  return schema.validate(details);
};

exports.validateBusinessProfileUpdate = (details) => {
  const schema = Joi.object({
    name: Joi.string().optional(),
    about: Joi.string().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
  });

  return schema.validate(details);
};

exports.validatePasswordChange = (data) => {
  const schema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
  });
  return schema.validate(data);
};

exports.addAddressValidation = (data) => {
  const addressSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
  });
  return addressSchema.validate(data);
};

exports.editAddressValidation = (details) => {
  const addressSchema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
  });
  return addressSchema
    .keys({
      addressId: Joi.string()
        .custom((value, helpers) => {
          if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.message("Invalid address ID");
          }
          return value;
        })
        .required(),
    })
    .validate(details);
};

exports.deleteAddressValidation = (details) => {
  const schema = Joi.object({
    addressId: Joi.string()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.message("Invalid chat ID");
        }
        return value;
      })
      .required(),
  });
  return schema.validate(details);
};
