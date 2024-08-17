const { cloudinaryAppealUploader } = require("../../middlewares/cloudinary");
const Appeal = require("../../models/appeal");
const Order = require("../../models/order");
const { validateAppealCreation } = require("../../utils/validation");

exports.createAppeal = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { error } = validateAppealCreation({ orderId, ...req.body });
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

    cloudinaryAppealUploader(imageFiles, async (error, uploadedImagesURL) => {
      if (error) {
        console.error(error);
        return res.status(400).json({
          status: false,
          message: "You've got some errors",
          error: error?.message,
        });
      } else {
        const { orderId, subject, description } = req.body;
        const userId = req.user.userId;

        const order = await Order.findById(orderId);

        if (!order) {
          return res
            .status(404)
            .json({ status: false, error: "Order not found" });
        }

        order.status = "Appeal";
        await order.save();

        const newAppeal = new Appeal({
          orderId,
          subject,
          description,
          images: uploadedImagesURL,
          user: userId,
        });

        const savedAppeal = await newAppeal.save();

        return res.status(201).json({
          status: true,
          message: "Appeal created successfully",
        });
      }
    });
  } catch (error) {
    next(error);
  }
};
