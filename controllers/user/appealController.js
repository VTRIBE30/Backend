const Appeal = require("../../models/appeal");
const { validateAppealCreation } = require("../../utils/validation");

exports.createAppeal = async (req, res, next) => {
  try {
    const { error } = validateAppealCreation(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    const { orderId, subject } = req.body;
    const userId = req.user.userId;

    const newAppeal = new Appeal({
      orderId,
      subject,
      user: userId,
    });

    const savedAppeal = await newAppeal.save();

    return res.status(201).json({
      status: true,
      message: "Appeal created successfully",
      appeal: savedAppeal,
    });
  } catch (error) {
    next(error);
  }
};
