const multer = require('multer');

const errorMiddleware = (err, req, res, next) => {
  // console.error(err); // Log the error for debugging purposes

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something totally went wrong 😔";

  // Custom error response based on the error type
  let responseBody = {
    status: false,
    message,
  };

  if (err instanceof multer.MulterError) {
    // Handle Multer-specific errors
    responseBody.error = "File upload error";
    return res.status(400).json(responseBody);
  }

  // For other errors, include additional details if available
  if (err.details) {
    responseBody.details = err.details;
  }

  // Send the error response
  return res.status(statusCode).json(responseBody);
};

module.exports = errorMiddleware;
