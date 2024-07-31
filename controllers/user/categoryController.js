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
