const { cloudinaryFeedMediaUploader } = require("../../middlewares/cloudinary");
const Comment = require("../../models/comment");
const Feed = require("../../models/feed");
const Product = require("../../models/product");
const {
  validateFeedPost,
  validateLikeFeedPost,
  validateCommentFeedPost,
} = require("../../utils/validation");

exports.createFeedPost = async (req, res, next) => {
  try {
    const { error } = validateFeedPost(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    if (!req.files) {
      return res.status(400).json({
        status: false,
        error: "Please add the feed media",
      });
    }

    const mediaFiles = req.files;

    cloudinaryFeedMediaUploader(mediaFiles, async (error, uploadedMediaURL) => {
      if (error) {
        console.error(error);
        return res.status(400).json({
          status: false,
          message: "You've got some errors",
          error: error?.message,
        });
      } else {
        const { mediaType, caption, productId } = req.body;
        const postedBy = req.user.userId;

        const newFeedPost = new Feed({
          media: uploadedMediaURL,
          caption,
          product: productId,
          postedBy,
          mediaType,
          likes: [],
          bookmarks: [],
          followers: [],
          comments: [],
        });

        await newFeedPost.save();

        return res.status(201).json({
          status: true,
          message: "Feed post created successfully",
          feedPost: newFeedPost,
        });
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.searchFeeds = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Search query cannot be empty",
      });
    }

    // Convert the query to a regular expression for case-insensitive search
    const regexQuery = new RegExp(query, "i");

    // Search for feeds based on captions containing the query
    const feedsByCaption = await Feed.find({
      caption: regexQuery,
    });

    // Search for products whose names contain the query
    const products = await Product.find({
      title: regexQuery,
    });

    // Extract product IDs from the found products
    const productIds = products.map((product) => product._id);

    // Search for feeds associated with these product IDs
    const feedsByProduct = await Feed.find({
      product: { $in: productIds },
    });

    // Extract hashtags from captions and find feeds that contain these hashtags
    const hashtagRegex = /#(\w+)/g; // Regex to detect hashtags
    const hashtags = [];
    feedsByCaption.forEach((feed) => {
      let match;
      while ((match = hashtagRegex.exec(feed.caption)) !== null) {
        hashtags.push(match[1]); // Extract hashtag without the #
      }
    });

    // Find feeds containing any of the hashtags
    const feedsByHashtag =
      hashtags.length > 0
        ? await Feed.find({
            caption: { $regex: hashtags.join("|"), $options: "i" },
          })
        : [];

    // Combine results
    const combinedFeeds = [
      ...new Set([
        ...feedsByCaption.map((feed) => feed._id.toString()),
        ...feedsByProduct.map((feed) => feed._id.toString()),
        ...feedsByHashtag.map((feed) => feed._id.toString()),
      ]),
    ];

    const uniqueFeeds = await Feed.find({ _id: { $in: combinedFeeds } })
      .populate("postedBy", "firstName lastName profilePic")
      .populate("product", "title price images")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      message: "Search results retrieved successfully",
      feeds: uniqueFeeds,
    });
  } catch (error) {
    next(error);
  }
};

exports.getFeedPosts = async (req, res, next) => {
  try {
    const feedPosts = await Feed.find()
      .populate("postedBy", "firstName lastName profilePic")
      .populate("product", "title price images")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      message: "Feed posts retrieved successfully",
      feedPosts,
    });
  } catch (error) {
    next(error);
  }
};

exports.likeFeedPost = async (req, res, next) => {
  try {
    const { feedPostId } = req.params; // Retrieve the feed post ID from request parameters
    const userId = req.user.userId; // Assume user ID is available in req.user

    const { error } = validateLikeFeedPost({ feedPostId });
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    // Find the feed post by ID
    const feedPost = await Feed.findById(feedPostId);

    if (!feedPost) {
      return res.status(404).json({
        status: false,
        message: "Feed post not found",
      });
    }

    // Check if the user has already liked this post
    const userHasLiked = feedPost.likes.includes(userId);

    if (userHasLiked) {
      // Remove the user's ID from the list of likes (dislike the post)
      feedPost.likes = feedPost.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Add the user's ID to the list of likes (like the post)
      feedPost.likes.push(userId);
    }

    // Save the updated feed post
    await feedPost.save();

    return res.status(200).json({
      status: true,
      message: userHasLiked
        ? "Feed post disliked successfully"
        : "Feed post liked successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.bookmarkFeedPost = async (req, res, next) => {
  try {
    const { feedPostId } = req.params; // Retrieve the feed post ID from request parameters
    const userId = req.user.userId; // Assume user ID is available in req.user

    const { error } = validateLikeFeedPost({ feedPostId });
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    // Find the feed post by ID
    const feedPost = await Feed.findById(feedPostId);

    if (!feedPost) {
      return res.status(404).json({
        status: false,
        message: "Feed post not found",
      });
    }

    // Check if the user has already liked this post
    const userHasBookmarked = feedPost.bookmarks.includes(userId);

    if (userHasBookmarked) {
      // Remove the user's ID from the list of likes (dislike the post)
      feedPost.bookmarks = feedPost.bookmarks.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Add the user's ID to the list of likes (like the post)
      feedPost.bookmarks.push(userId);
    }

    // Save the updated feed post
    await feedPost.save();

    return res.status(200).json({
      status: true,
      message: userHasBookmarked
        ? "Feed post removed from bookmarks"
        : "Feed post bookmarked successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.addCommentToFeedPost = async (req, res, next) => {
  try {
    const { feedPostId } = req.params; // Retrieve the feed post ID from request parameters
    const { error } = validateCommentFeedPost({ feedPostId, ...req.body });
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }
    const { content } = req.body; // Retrieve the comment content from the request body
    const userId = req.user.userId; // Assume user ID is available in req.user

    // Find the feed post by ID
    const feedPost = await Feed.findById(feedPostId);

    if (!feedPost) {
      return res.status(404).json({
        status: false,
        message: "Feed post not found",
      });
    }

    // Create a new comment
    const newComment = new Comment({
      content,
      postedBy: userId,
      feed: feedPostId,
    });

    // Save the new comment
    await newComment.save();

    // Add the comment ID to the feed post's comments array
    feedPost.comments.push(newComment._id);

    // Save the updated feed post
    await feedPost.save();

    return res.status(201).json({
      status: true,
      message: "Comment added successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.likeCommentPost = async (req, res, next) => {
  try {
    const { commentId } = req.params; // Retrieve the feed post ID from request parameters
    const userId = req.user.userId; // Assume user ID is available in req.user

    const { error } = validateLikeFeedPost({ feedPostId: commentId });
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    // Find the feed post by ID
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        status: false,
        message: "Comment not found",
      });
    }

    // Check if the user has already liked this post
    const userHasLiked = comment.likes.includes(userId);

    if (userHasLiked) {
      // Remove the user's ID from the list of likes (dislike the post)
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Add the user's ID to the list of likes (like the post)
      comment.likes.push(userId);
    }

    // Save the updated feed post
    await comment.save();

    return res.status(200).json({
      status: true,
      message: userHasLiked
        ? "Comment disliked successfully"
        : "Comment liked successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.fetchFeedPost = async (req, res, next) => {
  try {
    const { feedPostId } = req.params; // Retrieve the feed post ID from request parameters
    const { error } = validateLikeFeedPost({ feedPostId });
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }
    // Find the feed post by ID
    const feedPost = await Feed.findById(feedPostId);

    if (!feedPost) {
      return res.status(404).json({
        status: false,
        message: "Feed post not found",
      });
    }

    return res.status(201).json({
      status: true,
      message: "Feed Post fetched successfully",
      feedPost,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCommentsForFeedPost = async (req, res, next) => {
  try {
    const { feedPostId } = req.params; // Retrieve the feed post ID from request parameters

    const { error } = validateLikeFeedPost({ feedPostId });
    if (error) {
      return res.status(400).json({
        status: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    // Find the feed post by ID and populate the comments
    const feedPost = await Feed.findById(feedPostId).populate({
      path: "comments",
      populate: {
        path: "postedBy", // Assuming the Comment model has a reference to the User model
        select: "username", // Adjust fields as necessary
      },
    });

    if (!feedPost) {
      return res.status(404).json({
        status: false,
        message: "Feed post not found",
      });
    }

    // Respond with the comments
    return res.status(200).json({
      status: true,
      message: "Comments retrieved successfully",
      comments: feedPost.comments,
    });
  } catch (error) {
    next(error);
  }
};
