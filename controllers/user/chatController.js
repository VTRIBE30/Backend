const { cloudinaryChatImageUploader } = require("../../middlewares/cloudinary");
const Chat = require("../../models/chat");
const Message = require("../../models/message");
const User = require("../../models/user");
const {
  validateStartChat,
  validateSendMessage,
  validateChatId,
  validateGetMessages,
} = require("../../utils/validation");

exports.startChat = async (req, res, next) => {
  try {
    const { error } = validateStartChat(req.query);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }
    const { senderId, receiverId } = req.query;

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "sender or receiver not found" });
    }

    // Check if a chat already exists between the user and the receiver
    let chat = await Chat.findOne({
      sender: sender._id,
      receiver: receiver._id,
    });

    if (!chat) {
      chat = new Chat({ sender: sender._id, receiver: receiver._id });
      await chat.save();
    }

    return res.status(200).json({
      status: true,
      chat,
    });
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { senderId, content } = req.body;

    const data = {
      senderId,
      content,
      chatId,
    };

    const { error } = validateSendMessage(data);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    if (req.file) {
      const imageFile = req.file.path;
      cloudinaryChatImageUploader(imageFile, async (error, uploadedImageUrl) => {
        if (error) {
          console.error(error);
          return res.status(400).json({
            status: false,
            message: "You've got some errors",
            error: error?.message,
          });
        } else {
          const chat = await Chat.findById(chatId);
          const sender = await User.findById(senderId);

          if (!chat || !sender) {
            return res
              .status(404)
              .json({ message: "Chat or Sender not found" });
          }

          const message = new Message({
            chat: chat._id,
            sender: sender._id,
            content,
            image: uploadedImageUrl.secure_url
          });
          await message.save();

          chat.messages.push(message._id);
          chat.lastUpdated = Date.now();
          await chat.save();

          return res.status(200).json({
            status: true,
            message,
          });
        }
      });
    } else {
      const chat = await Chat.findById(chatId);
      const sender = await User.findById(senderId);

      if (!chat || !sender) {
        return res.status(404).json({ message: "Chat or Sender not found" });
      }

      const message = new Message({
        chat: chat._id,
        sender: sender._id,
        content,
      });
      await message.save();

      chat.messages.push(message._id);
      chat.lastUpdated = Date.now();
      await chat.save();

      return res.status(200).json({
        status: true,
        message,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get messages for a chat
exports.getMessages = async (req, res, next) => {
  try {
    const { error } = validateGetMessages(req.params);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    const { chatId } = req.params;

    const chat = await Chat.findById(chatId).populate("messages");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    return res.status(200).json({
      status: true,
      message: chat.messages,
    });
  } catch (error) {
    next(error);
  }
};
