const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");

const RECOMMENDATION_TIMEOUT_MS = 5000;

class RapidMinerError extends Error {}

const getFallbackRecommendations = async (userId, limit) => {
  const recentOrders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("items.product", "category");

  const categories = [
    ...new Set(
      recentOrders.flatMap((order) =>
        order.items
          .map((item) => item.product && item.product.category)
          .filter(Boolean),
      ),
    ),
  ];

  const filter = { stock: { $gt: 0 } };
  if (categories.length > 0) {
    filter.category = { $in: categories };
  } else {
    filter.isFeatured = true;
  }

  let recommendations = await Product.find(filter)
    .sort({ isFeatured: -1, createdAt: -1 })
    .limit(limit);

  if (recommendations.length === 0 && categories.length === 0) {
    recommendations = await Product.find({ stock: { $gt: 0 } })
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(limit);
  }

  return recommendations;
};

const requestRapidMinerRecommendations = async (userId, limit) => {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    RECOMMENDATION_TIMEOUT_MS,
  );
  const headers = { "Content-Type": "application/json" };

  if (process.env.RAPIDMINER_API_KEY) {
    headers.Authorization = `Bearer ${process.env.RAPIDMINER_API_KEY}`;
  }

  let productIds;
  try {
    const response = await fetch(process.env.RAPIDMINER_RECOMMENDATION_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ userId: String(userId), limit }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`RapidMiner returned HTTP ${response.status}`);
    }

    const payload = await response.json();
    const entries = Array.isArray(payload)
      ? payload
      : payload && payload.recommendations;

    if (!Array.isArray(entries)) {
      throw new Error("RapidMiner response must contain a recommendations array");
    }

    productIds = entries
      .map((entry) => {
        if (typeof entry === "string") {
          return entry;
        }
        return entry && (entry.productId || entry.id || entry._id);
      })
      .filter(
        (id) => typeof id === "string" && mongoose.isValidObjectId(id),
      )
      .slice(0, limit);

    if (productIds.length === 0) {
      throw new Error("RapidMiner returned no valid product IDs");
    }
  } catch (error) {
    throw new RapidMinerError(error.message);
  } finally {
    clearTimeout(timeout);
  }

  const products = await Product.find({
    _id: { $in: productIds },
    stock: { $gt: 0 },
  });
  const productsById = new Map(
    products.map((product) => [String(product._id), product]),
  );

  return productIds.map((id) => productsById.get(id)).filter(Boolean);
};

const getRecommendations = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 8);
    if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
      return res.status(400).json({
        success: false,
        message: "Limit must be an integer between 1 and 20",
      });
    }

    let recommendations;
    let source = "rapidminer";

    if (process.env.RAPIDMINER_RECOMMENDATION_URL) {
      try {
        recommendations = await requestRapidMinerRecommendations(
          req.user._id,
          limit,
        );
        if (recommendations.length === 0) {
          throw new RapidMinerError("RapidMiner recommendations are out of stock");
        }
      } catch (error) {
        if (!(error instanceof RapidMinerError)) {
          throw error;
        }
        console.warn(
          `RapidMiner recommendations unavailable; using catalog fallback: ${error.message}`,
        );
      }
    } else {
      console.info("RapidMiner URL not configured; using catalog fallback");
    }

    if (!recommendations || recommendations.length === 0) {
      source = "fallback";
      recommendations = await getFallbackRecommendations(req.user._id, limit);
    }

    res.status(200).json({
      success: true,
      source,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  getFallbackRecommendations,
  requestRapidMinerRecommendations,
};
