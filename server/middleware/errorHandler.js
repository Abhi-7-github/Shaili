/**
 * Standardized Error Handler Middleware for ShAili Backend
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode || 500;
  const errorCode = err.code || 'SERVER_ERROR';

  console.error(`[Error ${errorCode}]`, err.message || err);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected internal server error occurred.',
    },
  });
};

module.exports = errorHandler;
