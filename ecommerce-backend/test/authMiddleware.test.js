const assert = require("node:assert/strict");
const { afterEach, test } = require("node:test");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { protect } = require("../middleware/authMiddleware");

const originalJwtSecret = process.env.JWT_SECRET;
const originalFindById = User.findById;

afterEach(() => {
  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalJwtSecret;
  }
  User.findById = originalFindById;
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

test("protect rejects malformed or invalid bearer tokens", async () => {
  process.env.JWT_SECRET = "test-secret";
  const res = createResponse();

  await protect(
    { headers: { authorization: "Bearer not-a-valid-jwt" } },
    res,
    (error) => {
      throw error;
    },
  );

  assert.equal(res.statusCode, 401);
  assert.match(res.body.message, /invalid or expired/i);
});

test("protect passes database lookup errors to Express error handling", async () => {
  process.env.JWT_SECRET = "test-secret";
  const databaseError = new Error("database unavailable");
  const token = jwt.sign({ id: "507f1f77bcf86cd799439011" }, process.env.JWT_SECRET);
  User.findById = () => ({
    select: async () => {
      throw databaseError;
    },
  });

  const res = createResponse();
  let receivedError;
  await protect(
    { headers: { authorization: `Bearer ${token}` } },
    res,
    (error) => {
      receivedError = error;
    },
  );

  assert.equal(receivedError, databaseError);
  assert.equal(res.statusCode, 200);
});
