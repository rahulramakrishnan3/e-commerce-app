const assert = require("node:assert/strict");
const { afterEach, test } = require("node:test");
const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");
const {
  placeOrder,
} = require("../controllers/orderController");
const { getProducts } = require("../controllers/productController");

const originalProductFindById = Product.findById;
const originalProductFindOneAndUpdate = Product.findOneAndUpdate;
const originalOrderCreate = Order.create;

afterEach(() => {
  Product.findById = originalProductFindById;
  Product.findOneAndUpdate = originalProductFindOneAndUpdate;
  Order.create = originalOrderCreate;
});

const createResponse = () => ({
  statusCode: 200,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test("product listing rejects unsupported sort fields", async () => {
  const res = createResponse();

  await getProducts(
    { query: { sort: "password" } },
    res,
    (error) => {
      throw error;
    },
  );

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /sort field/i);
});

test("order uses database prices and reserves requested stock", async () => {
  const productId = new mongoose.Types.ObjectId();
  const product = {
    _id: productId,
    name: "Everyday Knit Sweater",
    price: 19.99,
    stock: 5,
    sizes: ["M"],
    colors: ["Navy"],
  };
  let reservedQuantity = 0;
  let savedOrder;

  Product.findById = async () => product;
  Product.findOneAndUpdate = async (_filter, update) => {
    reservedQuantity = -update.$inc.stock;
    return product;
  };
  Order.create = async (data) => {
    savedOrder = data;
    return { ...data, _id: new mongoose.Types.ObjectId() };
  };

  const res = createResponse();
  await placeOrder(
    {
      user: { _id: new mongoose.Types.ObjectId() },
      body: {
        items: [
          {
            product: productId.toString(),
            quantity: 2,
            price: 0.01,
            size: "M",
            color: "Navy",
          },
        ],
        shippingAddress: {
          fullName: "Test Customer",
          addressLine1: "10 Example Street",
          city: "Toronto",
          state: "Ontario",
          postalCode: "A1A 1A1",
          country: "Canada",
          phone: "555-0100",
        },
        paymentMethod: "cash_on_delivery",
      },
    },
    res,
    (error) => {
      throw error;
    },
  );

  assert.equal(res.statusCode, 201);
  assert.equal(reservedQuantity, 2);
  assert.equal(savedOrder.items[0].price, 19.99);
  assert.equal(savedOrder.subtotal, 39.98);
  assert.equal(savedOrder.total, 39.98);
});

test("order rejects invalid quantities before database writes", async () => {
  let productLookupCalled = false;
  Product.findById = async () => {
    productLookupCalled = true;
    return null;
  };

  const res = createResponse();
  await placeOrder(
    {
      user: { _id: new mongoose.Types.ObjectId() },
      body: { items: [{ product: "invalid-id", quantity: 0 }] },
    },
    res,
    (error) => {
      throw error;
    },
  );

  assert.equal(res.statusCode, 400);
  assert.equal(productLookupCalled, false);
});
