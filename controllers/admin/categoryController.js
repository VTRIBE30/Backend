const Category = require("../../models/category");
const Order = require("../../models/order");
const { validateCategoryCreate, validateCategoryId } = require("../../utils/validation");

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

exports.getDailyCommissionROI = async (req, res, next) => {
  try {
    // Get the current date and the start of the day (00:00:00)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Get the end of the day (23:59:59)
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Find all completed orders for today and sum up the commission
    const dailyCommissionStats = await Order.aggregate([
      {
        $match: {
          status: "Completed", // Only completed orders
          completedAt: {
            $gte: startOfDay,  // Orders completed from the start of today
            $lte: endOfDay,    // Orders completed till the end of today
          },
        },
      },
      {
        $group: {
          _id: null, // Group all documents together
          totalCommission: { $sum: "$commission" }, // Sum the commission from each order
          orderCount: { $sum: 1 }, // Count the number of completed orders
        },
      },
    ]);

    // If there are no completed orders, return 0 values
    if (dailyCommissionStats.length === 0) {
      return res.status(200).json({
        status: true,
        data: {
          totalCommission: 0,
          orderCount: 0,
          roi: 0, // Adjust based on your ROI calculation logic
        },
      });
    }

    // Extract the total commission and order count
    const { totalCommission, orderCount } = dailyCommissionStats[0];

    // Calculate the ROI if needed (if you have a base cost or investment amount to compare to)
    const roi = totalCommission; // Modify as per your ROI logic

    res.status(200).json({
      status: true,
      data: {
        totalCommission,
        orderCount,
        roi,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getCategoryCommission = async (req, res, next) => {
  try {
    const { error } = validateCategoryId(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    // Extract categoryId from request params
    const { categoryId } = req.params;

    // Find the total commission for all completed orders in the specified category
    const commissionStats = await Order.aggregate([
      {
        $lookup: {
          from: "products",   // Join with the products collection
          localField: "product",  // Field from the orders collection
          foreignField: "_id",    // Field from the products collection
          as: "productDetails"    // The result will be stored in productDetails array
        }
      },
      {
        $unwind: "$productDetails"  // Unwind the productDetails array
      },
      {
        $match: {
          "productDetails.categoryId": new mongoose.Types.ObjectId(categoryId),  // Match the categoryId
          status: "Completed", // Only completed orders
        }
      },
      {
        $group: {
          _id: null,  // Group all documents together
          totalCommission: { $sum: "$commission" },  // Sum the commission from each order
          orderCount: { $sum: 1 }, // Count the number of completed orders
        }
      },
    ]);

    // If no orders were found for this category, return 0 values
    if (commissionStats.length === 0) {
      return res.status(200).json({
        status: true,
        data: {
          totalCommission: 0,
          orderCount: 0,
        },
      });
    }

    // Extract the total commission and order count
    const { totalCommission, orderCount } = commissionStats[0];

    res.status(200).json({
      status: true,
      data: {
        totalCommission,
        orderCount,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};


