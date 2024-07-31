const Category = require("../../models/category");
const { validateCategoryCreate } = require("../../utils/validation");

exports.createCategory = async (req, res, next) => {
  try {
    const { error } = validateCategoryCreate(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }
    const { name, subCategories } = req.body;

    const newCategory = new Category({
      name,
      subCategories,
    });

    const savedCategory = await newCategory.save();

    return res.status(201).json({
      status: true,
      message: "Category created successfully",
    });
  } catch (error) {
    next(error);
  }
};
