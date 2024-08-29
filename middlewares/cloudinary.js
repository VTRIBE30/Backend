const cloudinary = require("cloudinary").v2;

function cloudinaryUserPfpUploader(imagePath, callback) {
  cloudinary.uploader.upload(
    imagePath,
    { folder: "vtribe/users/pfps" },
    function (error, result) {
      if (error) {
        callback(error, null);
      } else {
        callback(null, result);
      }
    }
  );
}

function cloudinaryChatImageUploader(imagePath, callback) {
  cloudinary.uploader.upload(
    imagePath,
    { folder: "vtribe/users/chat" },
    function (error, result) {
      if (error) {
        callback(error, null);
      } else {
        callback(null, result);
      }
    }
  );
}

function cloudinaryProdUploader(images, callback) {
  const uploadedImagesURL = [];
  let completedCount = 0;

  images.forEach((image, index) => {
    cloudinary.uploader.upload(
      image.path,
      { folder: "vtribe/products/images", resource_type: "auto" },
      function (error, result) {
        completedCount++;
        if (error) {
          callback(error, null);
          return; // Exit the function early if there's an error
        }
        uploadedImagesURL[index] = result.secure_url;

        // Check if all files have been uploaded
        if (completedCount === images.length) {
          callback(null, uploadedImagesURL);
        }
      }
    );
  });
}

function cloudinaryAppealUploader(images, callback) {
  const uploadedImagesURL = [];
  let completedCount = 0;

  images.forEach((image, index) => {
    cloudinary.uploader.upload(
      image.path,
      { folder: "vtribe/appeal/images", resource_type: "auto" },
      function (error, result) {
        completedCount++;
        if (error) {
          callback(error, null);
          return; // Exit the function early if there's an error
        }
        uploadedImagesURL[index] = result.secure_url;

        // Check if all files have been uploaded
        if (completedCount === images.length) {
          callback(null, uploadedImagesURL);
        }
      }
    );
  });
}

function cloudinaryOrderShipUploader(images, callback) {
  const uploadedImagesURL = [];
  let completedCount = 0;

  images.forEach((image, index) => {
    cloudinary.uploader.upload(
      image.path,
      { folder: "vtribe/appeal/images", resource_type: "auto" },
      function (error, result) {
        completedCount++;
        if (error) {
          callback(error, null);
          return; // Exit the function early if there's an error
        }
        uploadedImagesURL[index] = result.secure_url;

        // Check if all files have been uploaded
        if (completedCount === images.length) {
          callback(null, uploadedImagesURL);
        }
      }
    );
  });
}

function cloudinaryFeedMediaUploader(media, callback) {
  const uploadedMediaURL = [];
  let completedCount = 0;

  media.forEach((m, index) => {
    cloudinary.uploader.upload(
      m.path,
      { folder: "vtribe/feed/media", resource_type: "auto" }, // This handles both images and video
      function (error, result) {
        completedCount++;
        if (error) {
          callback(error, null);
          return; // Exit the function early if there's an error
        }
        uploadedMediaURL[index] = result.secure_url;

        // Check if all files have been uploaded
        if (completedCount === media.length) {
          callback(null, uploadedMediaURL);
        }
      }
    );
  });
}

module.exports = {
  cloudinaryUserPfpUploader,
  cloudinaryProdUploader,
  cloudinaryAppealUploader,
  cloudinaryOrderShipUploader,
  cloudinaryFeedMediaUploader,
  cloudinaryChatImageUploader,
};
