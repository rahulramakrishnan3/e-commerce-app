const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  createProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .get(getProducts)
  .post(protect, authorize("admin"), createProduct);

router.post("/bulk", protect, authorize("admin"), createProducts);

router
  .route("/:id")
  .get(getProductById)
  .put(protect, authorize("admin"), updateProduct)
  .delete(protect, authorize("admin"), deleteProduct);

module.exports = router;
