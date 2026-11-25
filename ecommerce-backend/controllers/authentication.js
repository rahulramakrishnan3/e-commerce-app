const jwt = require("jsonwebtoken");
const User = require("../models/user");

const createToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const register = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured",
      });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({ name, email, password });
    const token = createToken(user);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured",
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = createToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, publicUser };
