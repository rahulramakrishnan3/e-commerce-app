const assert = require("node:assert/strict");
const { afterEach, test } = require("node:test");
const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");
const { getRecommendations } = require("../controllers/analyticsController");

const originalOrderFind = Order.find;
const originalProductFind = Product.find;
const originalFetch = global.fetch;
const originalRapidMinerUrl = process.env.RAPIDMINER_RECOMMENDATION_URL;
const originalRapidMinerKey = process.env.RAPIDMINER_API_KEY;

afterEach(() => {
  Order.find = originalOrderFind;
  Product.find = originalProductFind;
  global.fetch = originalFetch;
  if (originalRapidMinerUrl === undefined) {
    delete process.env.RAPIDMINER_RECOMMENDATION_URL;
  } else {
    process.env.RAPIDMINER_RECOMMENDATION_URL = originalRapidMinerUrl;
  }
  if (originalRapidMinerKey === undefined) {
    delete process.env.RAPIDMINER_API_KEY;
  } else {
    process.env.RAPIDMINER_API_KEY = originalRapidMinerKey;
  }
});

const queryResult = (result) => ({
  sort() {
    return this;
  },
  limit() {
    return this;
  },
  populate() {
    return this;
  },
  then(resolve, reject) {
    return Promise.resolve(result).then(resolve, reject);
  },
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

test("recommendations use the catalog fallback when RapidMiner is unconfigured", async () => {
  delete process.env.RAPIDMINER_RECOMMENDATION_URL;
  Order.find = () => queryResult([]);
  const fallbackProduct = { _id: new mongoose.Types.ObjectId(), name: "Knit Top" };
  Product.find = () => queryResult([fallbackProduct]);
  const res = createResponse();

  await getRecommendations(
    { query: {}, user: { _id: new mongoose.Types.ObjectId() } },
    res,
    (error) => {
      throw error;
    },
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.source, "fallback");
  assert.deepEqual(res.body.recommendations, [fallbackProduct]);
});

test("recommendations resolve RapidMiner product IDs to in-stock catalog products", async () => {
  const firstId = new mongoose.Types.ObjectId();
  const secondId = new mongoose.Types.ObjectId();
  const products = [
    { _id: secondId, name: "Second Pick" },
    { _id: firstId, name: "First Pick" },
  ];
  process.env.RAPIDMINER_RECOMMENDATION_URL = "https://recommendations.example.test";
  process.env.RAPIDMINER_API_KEY = "test-api-key";
  global.fetch = async (url, options) => {
    assert.equal(url, process.env.RAPIDMINER_RECOMMENDATION_URL);
    assert.equal(options.method, "POST");
    assert.equal(options.headers.Authorization, "Bearer test-api-key");
    return {
      ok: true,
      json: async () => ({
        recommendations: [firstId.toString(), secondId.toString()],
      }),
    };
  };
  Product.find = (filter) => {
    assert.deepEqual(filter, {
      _id: { $in: [firstId.toString(), secondId.toString()] },
      stock: { $gt: 0 },
    });
    return queryResult(products);
  };
  const res = createResponse();

  await getRecommendations(
    { query: {}, user: { _id: new mongoose.Types.ObjectId() } },
    res,
    (error) => {
      throw error;
    },
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.source, "rapidminer");
  assert.deepEqual(
    res.body.recommendations.map((product) => product._id),
    [firstId, secondId],
  );
});

test("recommendations fall back when RapidMiner returns no in-stock products", async () => {
  const unavailableId = new mongoose.Types.ObjectId();
  const fallbackProduct = { _id: new mongoose.Types.ObjectId(), name: "Knit Top" };
  process.env.RAPIDMINER_RECOMMENDATION_URL = "https://recommendations.example.test";
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ recommendations: [unavailableId.toString()] }),
  });
  Order.find = () => queryResult([]);
  Product.find = (filter) => {
    if (filter._id) {
      return queryResult([]);
    }
    return queryResult([fallbackProduct]);
  };
  const res = createResponse();

  await getRecommendations(
    { query: {}, user: { _id: new mongoose.Types.ObjectId() } },
    res,
    (error) => {
      throw error;
    },
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.source, "fallback");
  assert.deepEqual(res.body.recommendations, [fallbackProduct]);
});
