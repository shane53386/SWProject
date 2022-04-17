const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

/* Load env vars */
dotenv.config({ path: "./config/config.env" });

/* Connect to databse */
connectDB();

/* Route files */
const auth = require("./routes/auth");
const restaurants = require("./routes/restaurants");

const app = express();

/* Mount routes */
app.use(express.json());

/* Cookie Parser */
app.use(cookieParser());

app.use("/api/v1/restaurants", restaurants);
app.use("/api/v1/auth", auth);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

/* handle unhandled promise rejections */
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);

  /* Close server & exit process */
  server.close(() => process.exit(1));
});
