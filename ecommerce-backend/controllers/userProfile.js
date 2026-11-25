const User = require("../models/user");
const { publicUser } = require("./authentication");

const getCurrentProfile = (req, res) => {
  res.status(200).json({
    success: true,
    user: publicUser(req.user),
  });
};

const updateCurrentProfile = async (req, res, next) => {
  try {
    const allowedFields = ["name"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No supported profile fields were provided",
      });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const deleteCurrentProfile = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getAllProfiles = async (_req, res, next) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users: users.map(publicUser),
    });
  } catch (error) {
    next(error);
  }
};

const updateProfileById = async (req, res, next) => {
  try {
    const allowedFields = ["name", "role"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No supported profile fields were provided",
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const deleteProfileById = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentProfile,
  updateCurrentProfile,
  deleteCurrentProfile,
  getAllProfiles,
  updateProfileById,
  deleteProfileById,
};
