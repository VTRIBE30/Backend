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

// Fetch recent chats
exports.getRecentChats = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Assuming req.user is populated with the authenticated user's data

    // Fetch recent chats involving the user either as sender or receiver, sorted by the last updated time
    const recentChats = await Chat.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ lastUpdated: -1 }) // Sort chats by the last update time, most recent first
      .populate({
        path: 'messages',
        options: { sort: { createdAt: -1 }, limit: 1 }, // Get the latest message in each chat
        populate: { path: 'sender', select: 'firstName lastName profilePic' }, // Populate sender details of the message
      })
      .populate('sender receiver', 'firstName lastName profilePic'); // Populate sender and receiver details

    // Format the response to include the necessary details
    const formattedChats = recentChats.map((chat) => {
      const lastMessage = chat.messages[0]; // The latest message in the chat
      const otherUser =
        chat.sender._id.toString() === userId ? chat.receiver : chat.sender; // Determine the other user in the chat

      return {
        userId: otherUser._id,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
        profilePic: otherUser.profilePic,
        lastMessage: lastMessage ? lastMessage.content : '',
        lastSender: lastMessage ? lastMessage.sender.firstName : '',
        lastTimestamp: lastMessage ? lastMessage.createdAt : chat.lastUpdated,
      };
    });

    return res.status(200).json({
      status: true,
      message: 'Recent chats fetched successfully',
      data: formattedChats,
    });
  } catch (error) {
    next(error);
  }
};
