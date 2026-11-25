require("dotenv").config();

const cors = require("cors");
const express = require("express");

const analyticsRoutes = require("./routes/analyticsRoutes");
const dbConnection = require("./config/dbConnection");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const authenticationRoutes = require("./routes/authenticationRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const userProfileRoutes = require("./routes/userProfileRoutes");

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);
app.use(express.json());

app.get("/api/status", (_req, res) => {
  res.status(200).json({
    status: "ok",
    app: "Knit and Thread",
  });
});

app.use("/api/auth", authenticationRoutes);
app.use("/api/profile", userProfileRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await dbConnection();
  } catch (error) {
    console.warn(`MongoDB unavailable: ${error.message}`);
  }

  app.listen(port, () => {
    console.log(`Knit and Thread API listening on port ${port}`);
  });
};

startServer();
