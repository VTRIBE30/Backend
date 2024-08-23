const mongoose = require("mongoose");

const feedSchema = new mongoose.Schema(
  {
    media: {
      type: Array,
      required: true,
    },
    caption: {
      type: String,
      maxlength: 280, // Limiting caption length to 280 characters
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true
    },
  },
  { 
    timestamps: true,
  }
);

const Feed = mongoose.model("Feed", feedSchema);

module.exports = Feed;
