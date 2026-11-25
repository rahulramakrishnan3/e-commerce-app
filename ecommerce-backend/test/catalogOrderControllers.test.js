const assert = require("node:assert/strict");
const { afterEach, test } = require("node:test");
const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");
const {
  placeOrder,
} = require("../controllers/orderController");
const {
  createProducts,
  getProducts,
} = require("../controllers/productController");

const originalProductFindById = Product.findById;
const originalProductFindOneAndUpdate = Product.findOneAndUpdate;
const originalProductInsertMany = Product.insertMany;
const originalOrderCreate = Order.create;

afterEach(() => {
  Product.findById = originalProductFindById;
  Product.findOneAndUpdate = originalProductFindOneAndUpdate;
  Product.insertMany = originalProductInsertMany;
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

const validProductData = (name = "Knit Sweater") => ({
  name,
  description: "Soft cotton knit sweater",
  category: "Sweaters",
  price: 49.99,
  stock: 10,
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

test("bulk product creation inserts all validated products", async () => {
  let insertedProducts;
  Product.insertMany = async (products, options) => {
    insertedProducts = products;
    assert.deepEqual(options, { ordered: true });
    return products.map((product) => ({
      ...product,
      _id: new mongoose.Types.ObjectId(),
    }));
  };

  const res = createResponse();
  await createProducts(
    { body: [validProductData("Knit Sweater"), validProductData("Wool Scarf")] },
    res,
    (error) => {
      throw error;
    },
  );

  assert.equal(res.statusCode, 201);
  assert.equal(insertedProducts.length, 2);
  assert.equal(res.body.count, 2);
  assert.equal(res.body.products.length, 2);
});

test("bulk product creation rejects the entire batch before insertion if one item is invalid", async () => {
  let insertManyCalled = false;
  Product.insertMany = async () => {
    insertManyCalled = true;
    return [];
  };

  const res = createResponse();
  await createProducts(
    {
      body: [
        validProductData("Valid Product"),
        { name: "Invalid Product", price: -1 },
      ],
    },
    res,
    (error) => {
      throw error;
    },
  );

  assert.equal(res.statusCode, 400);
  assert.equal(insertManyCalled, false);
  assert.equal(res.body.errors[0].index, 1);
  assert.equal(res.body.errors[0].message, "Product validation failed");
});

test("bulk product creation enforces the 100-product request limit", async () => {
  let insertManyCalled = false;
  Product.insertMany = async () => {
    insertManyCalled = true;
    return [];
  };

  const res = createResponse();
  await createProducts(
    { body: Array.from({ length: 101 }, () => validProductData()) },
    res,
    (error) => {
      throw error;
    },
  );

  assert.equal(res.statusCode, 400);
  assert.equal(insertManyCalled, false);
  assert.match(res.body.message, /between 1 and 100/i);
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
