const mongoose = require("mongoose");
const Product = require("../models/product");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const productFields = [
  "name",
  "description",
  "category",
  "brand",
  "price",
  "stock",
  "sizes",
  "colors",
  "images",
  "isFeatured",
];

const pickProductFields = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  const unknownFields = Object.keys(body).filter(
    (field) => !productFields.includes(field),
  );
  if (unknownFields.length > 0) {
    return null;
  }

  return body;
};

const getProducts = async (req, res, next) => {
  try {
    const filter = {};
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    if (search) {
      const expression = new RegExp(escapeRegex(String(search).trim()), "i");
      filter.$or = [
        { name: expression },
        { description: expression },
        { category: expression },
      ];
    }

    if (category) {
      filter.category = new RegExp(
        `^${escapeRegex(String(category).trim())}$`,
        "i",
      );
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter = {};
      if (minPrice !== undefined) {
        priceFilter.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        priceFilter.$lte = Number(maxPrice);
      }
      if (
        Object.values(priceFilter).some((value) => !Number.isFinite(value) || value < 0) ||
        (priceFilter.$gte !== undefined &&
          priceFilter.$lte !== undefined &&
          priceFilter.$gte > priceFilter.$lte)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid price range",
        });
      }
      filter.price = priceFilter;
    }

    const allowedSortFields = ["createdAt", "name", "price"];
    if (
      !allowedSortFields.includes(String(sort)) ||
      !["asc", "desc"].includes(String(order))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid sort field or order",
      });
    }

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 12);
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Page must be positive and limit must be between 1 and 100",
      });
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ [sort]: order === "asc" ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const productData = pickProductFields(req.body);
    if (!productData || Object.keys(productData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide valid product fields",
      });
    }

    const product = await Product.create(productData);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const updates = pickProductFields(req.body);
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide valid product fields",
      });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
      strict: "throw",
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
