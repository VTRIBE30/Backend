const { cloudinaryFeedMediaUploader } = require("../../middlewares/cloudinary");
const Feed = require("../../models/feed");
const Product = require("../../models/product");
const { validateFeedPost } = require("../../utils/validation");

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
    const regexQuery = new RegExp(query, 'i');

    // Search for feeds based on captions containing the query
    const feedsByCaption = await Feed.find({
      caption: regexQuery
    });

    // Search for products whose names contain the query
    const products = await Product.find({
      title: regexQuery
    });

    // Extract product IDs from the found products
    const productIds = products.map(product => product._id);

    // Search for feeds associated with these product IDs
    const feedsByProduct = await Feed.find({
      product: { $in: productIds }
    });

    // Extract hashtags from captions and find feeds that contain these hashtags
    const hashtagRegex = /#(\w+)/g; // Regex to detect hashtags
    const hashtags = [];
    feedsByCaption.forEach(feed => {
      let match;
      while ((match = hashtagRegex.exec(feed.caption)) !== null) {
        hashtags.push(match[1]); // Extract hashtag without the #
      }
    });

    // Find feeds containing any of the hashtags
    const feedsByHashtag = hashtags.length > 0 ? await Feed.find({
      caption: { $regex: hashtags.join('|'), $options: 'i' }
    }) : [];

    // Combine results
    const combinedFeeds = [
      ...new Set([
        ...feedsByCaption.map(feed => feed._id.toString()),
        ...feedsByProduct.map(feed => feed._id.toString()),
        ...feedsByHashtag.map(feed => feed._id.toString())
      ])
    ];

    const uniqueFeeds = await Feed.find({ _id: { $in: combinedFeeds } });

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
      .populate("product", "title price")
      .populate("comments")
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

exports.addCommentToFeed = async (req, res, next) => {
  try {
    const { content, feedId } = req.body;
    const postedBy = req.user._id;

    const newComment = new Comment({
      content,
      postedBy,
      feed: feedId,
    });

    await newComment.save();

    const feedPost = await Feed.findById(feedId);
    feedPost.comments.push(newComment._id);
    await feedPost.save();

    return res.status(201).json({
      status: true,
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    next(error);
  }
};
