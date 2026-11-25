const express = require("express");
const { getRecommendations } = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/recommendations", protect, getRecommendations);

module.exports = router;
