const Notification = require("../models/notification");

exports.sendNotification = async (templateData, next) => {
  try {
    const notification = new Notification(templateData);
    await notification.save();
    return true;
  } catch (error) {
    next(error);
  }
};
