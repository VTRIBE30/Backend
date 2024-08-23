const { cloudinaryOrderShipUploader } = require("../../middlewares/cloudinary");
const Offer = require("../../models/offer");
const Order = require("../../models/order");
const Product = require("../../models/product");
const Wallet = require("../../models/wallet");
const {
  vaidateOrder,
  vaidateOrderId,
  vaidateOrderStatus,
  vaidateMakeOffer,
  vaidateRespondToOffer,
  vaidateShipOrder,
} = require("../../utils/validation");

exports.placeOrder = async (req, res, next) => {
  try {
    const paymentOption = req?.query?.paymentOption;
    const { error } = vaidateOrder({ paymentOption, ...req.body });
    if (error) {
      return res
        .status(400)
        .json({ status: false, error: error.details[0].message });
    }

    const { orderQuantity, size, deliveryAddress, totalPrice, productId } =
      req.body;
    const userId = req.user.userId;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ status: false, error: "Product not found" });
    }

    const checkOrderPrice = product.price * orderQuantity === totalPrice;

    if (!checkOrderPrice) {
      return res.status(400).json({
        status: false,
        error: "Price manipulation detected, Try again",
      });
    }

    const order = new Order({
      user: userId,
      product: productId,
      orderQuantity,
      size,
      deliveryAddress,
      paymentOption,
      totalPrice,
      userRole: "Buyer",
    });

    // Check payment option and deduct from user's wallet if applicable
    if (paymentOption === "Wallet Balance") {
      const wallet = await Wallet.findOne({ userId });
      //   console.log(wallet);

      if (!wallet) {
        return res
          .status(400)
          .json({ status: false, error: "Wallet not found" });
      }
      if (wallet.balance < totalPrice) {
        return res
          .status(400)
          .json({ status: false, error: "Insufficient wallet balance" });
      }

      wallet.balance -= totalPrice;
      await wallet.save();

      order.status = "Paid";
    }

    await order.save();

    return res.status(201).json({
      status: true,
      message: "Order placed successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrderDetails = async (req, res, next) => {
  try {
    const { error } = vaidateOrderId(req.params);
    if (error) {
      return res
        .status(400)
        .json({ status: false, error: error.details[0].message });
    }
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user", "firstName lastName email")
      .populate("product");

    if (!order) {
      return res.status(404).json({ status: false, error: "Order not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Order details retrieved successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

exports.submitShippingDetails = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { error } = vaidateShipOrder({ orderId, ...req.body });
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

    cloudinaryOrderShipUploader(
      imageFiles,
      async (error, uploadedImagesURL) => {
        if (error) {
          console.error(error);
          return res.status(400).json({
            status: false,
            message: "You've got some errors",
            error: error?.message,
          });
        } else {
          const { details, trackingNumber, deliveryFee } = req.body;

          const order = await Order.findOneAndUpdate(
            { _id: orderId },
            {
              $set: {
                details: details,
                trackingNumber: trackingNumber,
                deliveryFee: deliveryFee,
                images: uploadedImagesURL,
              },
            },
            { new: true }
          );

          if (!order) {
            return res
              .status(404)
              .json({ status: false, error: "Order not found" });
          }

          return res.status(200).json({
            status: true,
            message: "Order shipping details successfully added",
          });
        }
      }
    );
  } catch (error) {
    next(error);
  }
};

exports.shipOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { error } = vaidateOrderId({ orderId });
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }
    const order = await Order.findOneAndUpdate(
      { _id: orderId },
      {
        $set: {
          status: "Shipped"
        },
      },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ status: false, error: "Order not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Order shipped successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.completeOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { error } = vaidateOrderId({ orderId });
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }
    const order = await Order.findOneAndUpdate(
      { _id: orderId },
      {
        $set: {
          status: "Completed"
        },
      },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ status: false, error: "Order not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Order completed successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({ user: userId })
      .populate("product")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      message: "User orders retrieved successfully",
      orders,
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrdersByStatus = async (req, res, next) => {
  try {
    const { error } = vaidateOrderStatus(req.params);
    if (error) {
      return res
        .status(400)
        .json({ status: false, error: error.details[0].message });
    }
    const { status } = req.params;
    const userId = req.user.userId;

    const orders = await Order.find({ user: userId, status })
      .populate("product")
      .populate("user");

    return res.status(200).json({
      status: true,
      message: `Orders with status '${status}' retrieved successfully`,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

exports.makeOffer = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { error } = vaidateMakeOffer({ productId, ...req.body });
    if (error) {
      return res
        .status(400)
        .json({ status: false, error: error.details[0].message });
    }
    const userId = req.user.userId;

    // Check if the product exists
    const { offerPrice } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ status: false, error: "Product not found" });
    }

    // Create a new offer
    const newOffer = new Offer({
      productId,
      userId,
      offerPrice,
    });

    await newOffer.save();

    return res.status(201).json({
      status: true,
      message: "Offer made successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.respondToOffer = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const { error } = vaidateRespondToOffer({ offerId, ...req.body });
    if (error) {
      return res
        .status(400)
        .json({ status: false, error: error.details[0].message });
    }

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({ status: false, error: "Offer not found" });
    }

    // Update the offer status
    offer.status = req.body.status;
    if (req.body.bestPrice) {
      offer.bestPrice = req.body.bestPrice;
    }
    await offer.save();

    return res.status(200).json({
      status: true,
      message: `Offer set to ${req.body.status.toLowerCase()} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

exports.getOffersMadeByUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const offers = await Offer.find({ userId })
      .populate("productId", "title images price")
      .exec();

    return res.status(200).json({
      status: true,
      message: "Offers made by the user retrieved successfully",
      offers,
    });
  } catch (error) {
    next(error);
  }
};

exports.getOffersOnUserProducts = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Find all products listed by the user
    const products = await Product.find({ postedBy: userId }).select("_id");

    if (products.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No products listed by the user",
        offers: [],
      });
    }

    const productIds = products.map((product) => product._id);

    // Find all offers on the user's products
    const offers = await Offer.find({ productId: { $in: productIds } })
      .populate("productId", "title images price")
      .populate("userId", "firstName lastName email")
      .exec();

    return res.status(200).json({
      status: true,
      message: "Offers received on user's products retrieved successfully",
      offers,
    });
  } catch (error) {
    next(error);
  }
};
