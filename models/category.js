const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  commission: { type: Number, default: 0, required: true },
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subCategories: [subCategorySchema],
  commission: { type: Number, default: 0, required: true },
  tags: { type: [String], default: [] }, // Tags for searchability
  attributes: {
    type: Map, 
    of: [String], // Attributes like size, color, etc.
  },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
