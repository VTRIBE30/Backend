const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userRole: {
      type: String,
      enum: ["Buyer", "Seller"],
      required: true,
    },
    orderQuantity: { type: Number, required: true },
    size: { type: String, required: true },
    deliveryAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
    },
    paymentOption: {
      type: String,
      enum: ["Wallet Balance", "Crypto-Currency", "Bank Transfer"],
    },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Appeal", "Shipped", "Completed", "Failed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
