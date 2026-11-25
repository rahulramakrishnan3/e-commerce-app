const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");

const restoreInventory = async (items) => {
  for (const item of items) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { stock: item.quantity } },
    );
  }
};

const placeOrder = async (req, res, next) => {
  const reservedItems = [];

  try {
    const { items, shippingAddress, paymentMethod } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one order item is required",
      });
    }
    if (!shippingAddress || !["cash_on_delivery", "card"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "A shipping address and valid payment method are required",
      });
    }

    const quantities = new Map();
    for (const item of items) {
      if (
        !item.product ||
        !mongoose.isValidObjectId(item.product) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Each item must have a valid product ID and positive integer quantity",
        });
      }

      const key = String(item.product);
      const current = quantities.get(key) || { quantity: 0, selections: [] };
      current.quantity += item.quantity;
      current.selections.push(item);
      quantities.set(key, current);
    }

    const orderItems = [];
    for (const [productId, requested] of quantities) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${productId}`,
        });
      }

      if (product.stock < requested.quantity) {
        return res.status(409).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      for (const selection of requested.selections) {
        if (selection.size && product.sizes.length && !product.sizes.includes(selection.size)) {
          return res.status(400).json({
            success: false,
            message: `Invalid size selected for ${product.name}`,
          });
        }
        if (
          selection.color &&
          product.colors.length &&
          !product.colors.includes(selection.color)
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid color selected for ${product.name}`,
          });
        }

        orderItems.push({
          product: product._id,
          name: product.name,
          quantity: selection.quantity,
          price: product.price,
          size: selection.size,
          color: selection.color,
        });
      }
    }

    for (const [productId, requested] of quantities) {
      const reserved = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: requested.quantity } },
        { $inc: { stock: -requested.quantity } },
        { new: true },
      );

      if (!reserved) {
        await restoreInventory(reservedItems);
        return res.status(409).json({
          success: false,
          message: "Stock changed while placing the order; please try again",
        });
      }

      reservedItems.push({ product: productId, quantity: requested.quantity });
    }

    const subtotal =
      Math.round(
        orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0) *
          100,
      ) / 100;
    const shippingCost = 0;
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    if (reservedItems.length > 0) {
      try {
        await restoreInventory(reservedItems);
      } catch (restoreError) {
        console.error("Failed to restore inventory after order error", restoreError);
      }
    }
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const filter = req.user.role === "admin" ? {} : { user: req.user._id };
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.product", "name images");

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name images");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      (!order.user || !order.user._id.equals(req.user._id))
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this order",
      });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const nextStatuses = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };
    const requestedStatus = req.body && req.body.status;
    if (!Object.prototype.hasOwnProperty.call(nextStatuses, requestedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const currentOrder = await Order.findById(req.params.id);
    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    if (!nextStatuses[currentOrder.status].includes(requestedStatus)) {
      return res.status(409).json({
        success: false,
        message: `Order cannot transition from ${currentOrder.status} to ${req.body.status}`,
      });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, status: currentOrder.status },
      { status: requestedStatus },
      { new: true, runValidators: true },
    );

    if (!order) {
      return res.status(409).json({
        success: false,
        message: "Order status changed; reload and try again",
      });
    }

    if (order.status === "cancelled") {
      try {
        await restoreInventory(order.items);
      } catch (error) {
        console.error(`Failed to restore inventory for cancelled order ${order._id}`, error);
        return next(error);
      }
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { placeOrder, getOrders, getOrderById, updateOrderStatus };
