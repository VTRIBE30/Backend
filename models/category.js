const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  commission: { type: Number, default: 0, required: true },
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  subCategories: [subCategorySchema],
  commission: { type: Number, default: 0, required: true },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
