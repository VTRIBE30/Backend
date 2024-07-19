const cloudinary = require('cloudinary').v2;

function cloudinaryKycUploader(images, callback) {
    // console.log(images)
    // if
    const uploadedImagesURL = [];
    let completedCount = 0;

    images.forEach((image, index) => {
        cloudinary.uploader.upload(image.path, { folder: 'vtribe/kycDocuments', resource_type: 'auto' }, function (error, result) {
            completedCount++;
            if (error) {
                callback(error, null);
                return; 
            }
            uploadedImagesURL[index] = result.secure_url;

            if (completedCount === images.length) {
                callback(null, uploadedImagesURL);
            }
        });
    });
}

module.exports = { cloudinaryKycUploader };