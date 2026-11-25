const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const tokenMatch = authHeader && /^Bearer\s+(\S+)$/i.exec(authHeader);

  if (!tokenMatch) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: "JWT_SECRET is not configured",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(tokenMatch[1], process.env.JWT_SECRET);
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }

  try {
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User associated with this token no longer exists",
      });
    }

    req.user = user;
  } catch (error) {
    return next(error);
  }

  next();
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to perform this action",
    });
  }

  next();
};

module.exports = { protect, authorize };
