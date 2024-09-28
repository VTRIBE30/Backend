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

    const { name, subCategory, commissionPercent, tags, attributes } = req.body;

    // Check if category exists by name
    let existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      // If category exists, add sub-category under it
      const existingSubCategory = existingCategory.subCategories.find(
        (subCat) => subCat.name === subCategory
      );

      if (existingSubCategory) {
        return res.status(409).json({
          status: false,
          message: `Sub-category '${subCategory}' already exists under '${name}'`,
        });
      }

      // Add the new sub-category
      existingCategory.subCategories.push({
        name: subCategory,
        commission: commissionPercent,
      });

      await existingCategory.save();

      return res.status(200).json({
        status: true,
        message: `Sub-category '${subCategory}' added to category '${name}' successfully`,
      });
    } else {
      // If category does not exist, create a new one
      const newCategory = new Category({
        name,
        subCategories: [
          {
            name: subCategory,
            commission: commissionPercent,
          },
        ],
        commission: commissionPercent,
        tags: tags || [],
        attributes: attributes || {},
      });

      await newCategory.save();

      return res.status(201).json({
        status: true,
        message: "Category and sub-category created successfully",
        data: newCategory,
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getTotalCommission = async (req, res, next) => {
  try {
    // Sum the total commission from all completed orders
    const totalCommission = await Order.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, totalCommission: { $sum: '$commissionAmount' } } }
    ]);

    const commission = totalCommission.length ? totalCommission[0].totalCommission : 0;

    return res.status(200).json({
      status: true,
      totalCommission: commission,
    });
  } catch (error) {
    next(error);
  }
};

