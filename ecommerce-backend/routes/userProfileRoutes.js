const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getCurrentProfile,
  updateCurrentProfile,
  deleteCurrentProfile,
  getAllProfiles,
  updateProfileById,
  deleteProfileById,
} = require("../controllers/userProfile");

const router = express.Router();

router.get("/me", protect, getCurrentProfile);
router.put("/me", protect, updateCurrentProfile);
router.delete("/me", protect, deleteCurrentProfile);

router.get("/", protect, authorize("admin"), getAllProfiles);
router.put("/:id", protect, authorize("admin"), updateProfileById);
router.delete("/:id", protect, authorize("admin"), deleteProfileById);

module.exports = router;
