const Category = require("../../models/category");

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    return res.status(200).json({
      status: true,
      message: "Categories retrieved successfully",
      categories,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSubcategoriesByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId).populate("subCategories");

    if (!category) {
      return res.status(404).json({
        status: false,
        error: "Category not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Subcategories retrieved successfully",
      subCategories: category.subCategories,
    });
  } catch (error) {
    next(error);
  }
};