const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || error.status || 500;
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error"
      : error.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
  });
};

const notFound = (req, res, _next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };
