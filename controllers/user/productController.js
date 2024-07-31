const { cloudinaryProdUploader } = require("../../middlewares/cloudinary");
const Product = require("../../models/product");
const { validateProduct } = require("../../utils/validation");

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
