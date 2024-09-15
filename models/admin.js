const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "SUB_ADMIN",
      enum: ["SUPER_ADMIN", "SUB_ADMIN"],
    },
    permissions: {
      type: [String],
      required: true,
      enum: [
        "MEDIATE_IN_DISPUTE",
        "READ_AND_RESPOND_TO_MESSAGES",
        "VIEW_LISTING",
        "DECLINE_AND_APPROVE_LISTING",
        "SEE_TRANSACTIONS",
        "APPROVE_PAYOUT_REQUESTS",
      ],
    },
    profilePic: {
      type: String,
      required: true,
      default:
        "https://res.cloudinary.com/dlguxtmj2/image/upload/v1721401143/VTribe/v1/static/default-pfp.jpg",
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
