const express = require("express");
const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurants");

const router = express.Router();
const app = express();
const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(getRestaurants)
  .post(protect, authorize("admin"), createRestaurant);

router
  .route("/:id")
  .get(getRestaurant)
  .put(protect, authorize("admin"), updateRestaurant)
  .delete(protect, authorize("admin"), deleteRestaurant);

module.exports = router;
