const cloudinary = require('cloudinary').v2;

function cloudinaryUserPfpUploader(imagePath, callback) {
    cloudinary.uploader.upload(imagePath, { folder: 'vtribe/users/pfps' }, function (error, result) {
        if (error) {
            callback(error, null);
        } else {
            callback(null, result);
        }
    });
}

module.exports = { cloudinaryUserPfpUploader };