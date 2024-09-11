const { cloudinaryProdUploader } = require("../../middlewares/cloudinary");
const Flag = require("../../models/flag");
const Product = require("../../models/product");
const Review = require("../../models/reviews");
const User = require("../../models/user");
const {
  validateProduct,
  validateProductSearchQuery,
  vaidateProductId,
  vaidateProductFlag,
  vaidateReview,
  vaidateSellerId,
} = require("../../utils/validation");

exports.createProduct = async (req, res, next) => {
  try {

    const { error } = validateProduct(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    if (!req.files) {
      return res.status(400).json({
        status: false,
        error: "Please add the product images",
      });
    }

    const imageFiles = req.files;

    const {
      title,
      video,
      shippingAddress,
      location,
      condition,
      negotiable,
      totalPrice,
      price,
      bulkPrice,
      delivery,
      promoted,
      abroadShipping,
      shippingOptions,
      categoryId,
      subCategory,
      gender,
      description,
      color,
    } = req.body;
    cloudinaryProdUploader(imageFiles, async (error, uploadedImagesURL) => {
      if (error) {
        console.error(error);
        return res.status(400).json({
          status: false,
          message: "You've got some errors",
          error: error?.message,
        });
      } else {
        let newProduct = new Product({
          title,
          video,
          shippingAddress,
          location,
          condition,
          negotiable,
          totalPrice,
          price,
          bulkPrice,
          delivery,
          commission: totalPrice * 0.01,
          promoted,
          abroadShipping,
          shippingOptions,
          categoryId,
          subCategory,
          gender,
          images: uploadedImagesURL,
          description,
          color,
          postedBy: req.user.userId,
        });
        let savedProduct = await newProduct.save();
        if (savedProduct) {
          return res.status(201).json({
            status: true,
            message: "Product added successfully",
          });
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate("categoryId")
      .populate({
        path: "postedBy",
        select: "business _id email profilePic firstName gender lastName phoneNumber",
      })
      .populate("reviews");

    return res.status(200).json({
      status: true,
      message: "Products retrieved successfully",
      products,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductsBySeller = async (req, res, next) => {
  try {
    const { error } = vaidateSellerId(req.params);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }
    const { sellerId } = req.params;
    const products = await Product.find({ postedBy: sellerId })
      .populate("categoryId")
      .populate("reviews");

    return res.status(200).json({
      status: true,
      message: "Products retrieved successfully",
      products,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ categoryId: categoryId })
      .populate("categoryId")
      .populate("reviews");

    return res.status(200).json({
      status: true,
      message: "Products retrieved successfully",
      products,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductsBySubcategory = async (req, res, next) => {
  try {
    const { subCategory } = req.params;
    // console.log("Subcategory:", subCategory); // Debugging line

    const products = await Product.find({ subCategory })
      .populate("categoryId")
      .populate("reviews");

    // console.log("Products:", products); // Debugging line

    if (!products.length) {
      return res.status(404).json({
        status: false,
        message: "No products found for this subcategory",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Products retrieved successfully",
      products,
    });
  } catch (error) {
    next(error);
  }
};

exports.searchProducts = async (req, res, next) => {
  try {
    const { error } = validateProductSearchQuery(req.query);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }
    const {
      title,
      category,
      subCategory,
      minPrice,
      maxPrice,
      condition,
      location,
      gender,
    } = req.query;

    const query = {};

    if (title) {
      query.title = { $regex: title, $options: "i" }; // Case-insensitive regex search
    }
    if (category) {
      query.categoryId = category; // Assuming category is passed as category ID
    }
    if (subCategory) {
      query.subCategory = subCategory;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = minPrice;
      }
      if (maxPrice) {
        query.price.$lte = maxPrice;
      }
    }
    if (condition) {
      query.condition = condition;
    }
    if (location) {
      query["location.city"] = location;
    }
    if (gender) {
      query.gender = gender;
    }

    const products = await Product.find(query)
      .populate("categoryId")
      .populate("reviews");

    if (!products.length) {
      return res.status(404).json({
        status: false,
        message: "No products found for this search",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Products retrieved successfully",
      products,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductDetails = async (req, res, next) => {
  try {
    const { error } = vaidateProductId(req.params);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }
    const { productId } = req.params;
    const product = await Product.findById(productId)
      .populate("categoryId")
      .populate("reviews")
      .populate("postedBy", [
        "business",
        "profilePic",
        "firstName",
        "lastName",
        "phoneNumber",
      ]);

    if (!product) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Product details retrieved successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

exports.flagProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { reason } = req.body;
    const { error } = vaidateProductFlag({ reason, ...req.params });
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }
    const userId = req.user.userId; // Assuming `req.user` contains the authenticated user's ID

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Create and save the flag
    const flag = new Flag({
      productId,
      userId,
      reason,
    });

    await flag.save();

    return res.status(201).json({
      status: true,
      message: "Product flagged successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductsByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;

    // Validate the status
    const validStatuses = ["Active", "Pending", "Sold"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: false,
        message: `Invalid status, Status should be "Active", "Pending", "Sold"`,
      });
    }

    const products = await Product.find({ status })
      .populate("categoryId")
      .populate("reviews");

    return res.status(200).json({
      status: true,
      message: `Products with status ${status} retrieved successfully`,
      products,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserPostedProducts = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const products = await Product.find({ postedBy: userId });

    return res.status(200).json({
      status: true,
      message: "User posted products retrieved successfully",
      products,
    });
  } catch (error) {
    next(error);
  }
};

exports.addReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { error } = vaidateReview({ productId, ...req.body });
    if (error) {
      return res
        .status(400)
        .json({ status: false, error: error.details[0].message });
    }

    const { rating, comment } = req.body;
    const userId = req.user.userId;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ status: false, error: "Product not found" });
    }

    const review = new Review({
      user: userId,
      product: productId,
      rating,
      comment,
    });

    await review.save();

    return res.status(201).json({
      status: true,
      message: "Review added successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get Reviews for a Product
exports.getReviews = async (req, res, next) => {
  try {
    const { productId } = req.query;
    const { error } = vaidateProductId(req.query);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    const reviews = await Review.find({ product: productId })
      .populate("user", "firstName lastName profilePic")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      message: "Reviews retrieved successfully",
      reviews,
    });
  } catch (error) {
    next(error);
  }
};
