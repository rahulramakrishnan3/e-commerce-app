const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
    },
    brand: {
      type: String,
      default: "Knit and Thread",
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      min: 0,
      default: 0,
    },
    sizes: [
      {
        type: String,
        trim: true,
      },
    ],
    colors: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", description: "text", category: "text" });

module.exports = mongoose.model("Product", productSchema);
