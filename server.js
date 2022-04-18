const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

/* Import security module */
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

/* Load env vars */
dotenv.config({ path: "./config/config.env" });

/* Connect to database */
connectDB();

/* Route files */
const auth = require("./routes/auth");
const restaurants = require("./routes/restaurants");
const reservations = require("./routes/reservations");

const app = express();

/* Mount routes */
app.use(express.json());

/* Cookie Parser */
app.use(cookieParser());

/* Security */
const limiter = rateLimit({
	windowsMs: 10 * 60 * 1000,
	max: 100,
});
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(limiter);
app.use(hpp());
app.use(cors());

app.use("/api/v1/auth", auth);
app.use("/api/v1/restaurants", restaurants);
app.use("/api/v1/reservations", reservations);

const PORT = process.env.PORT || 5000;

const server = app.listen(
	PORT,
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
	)
);

/* handle unhandled promise rejections */
process.on("unhandledRejection", (err, promise) => {
	console.log(`Error: ${err.message}`);

	/* Close server & exit process */
	server.close(() => process.exit(1));
});
