const errorMiddleware = (err, req, res, next) => {
  console.error(err); // Log the error for debugging purposes

  // Default error response
  const statusCode = err.statusCode || 500;
  const error = 'Internal Server Error';
  const message = err.message || 'Something totally went wrong 😔';

  // Custom error response based on the error type
  let responseBody = {
    status: false,
    error,
    message
  };
  if (err.details) {
    responseBody.details = err.details;
  }

  // Send the error response
  return res.status(statusCode).json(responseBody);
};

module.exports = errorMiddleware;
