const mongoose = require("mongoose");

const bulkPriceSchema = new mongoose.Schema({
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const deliverySchema = new mongoose.Schema({
  city: { type: String, required: true },
  estimatedTime: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema(
  {
    images: { type: Array, required: true },
    video: { type: String, required: true },
    shippingAddress: {
      city: { type: String, required: true },
      state: { type: String, required: true },
    },
    location: {
      city: { type: String, required: true },
      state: { type: String, required: true },
    },
    title: { type: String, required: true },
    condition: { type: String, enum: ["New", "Fairly Used"], required: true },
    negotiable: { type: Boolean, default: false, required: true },
    totalPrice: { type: Number, required: true },
    price: { type: Number, required: true },
    bulkPrice: [bulkPriceSchema],
    delivery: [deliverySchema],
    commission: { type: Number, required: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    promoted: { type: Boolean, default: false },
    abroadShipping: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Active", "Pending", "Sold"],
      default: "Active",
    },
    shippingOptions: {
      type: Array,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: { type: String, required: true },
    gender: {
      type: String,
      enum: ["Male", "Female", "Unisex"],
      required: true,
    },
    color: {
      type: Array,
      required: true,
    },
    description: { type: String, required: true },
    reviews: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
