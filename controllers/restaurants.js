const Restaurant = require("../models/Restaurant.js");

/*
 * @desc     GET all restaurants
 * @routes   GET /api/v1/restaurants
 * @access   Public
 */
exports.getRestaurants = async (req, res, next) => {
  let query;

  /* Copy req.query */
  const reqQuery = { ...req.query };

  /* Fields to exclude */
  const removeFields = ["select", "sort", "page", "limit"];

  /* Loop over remove fields and delete them from reqQuery */
  removeFields.forEach((param) => delete reqQuery[param]);

  /* Create query string*/
  let queryStr = JSON.stringify(req.query);

  /* Create operator ($gt, $gte ,etc) */
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  console.log("queryStr : ", queryStr);

  /* Finding resource */
  /* TODO UNCOMMENT THE CODE BELOW TO POPULATE TO RESERVATIONS*/
  // query = Restaurant.find(JSON.parse(queryStr)).populate("reservations");
  query = Restaurant.find(JSON.parse(queryStr));

  /* Select Field */
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
    console.log("fields :", fields);
  }

  /* Select Fields */
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    console.log("sortBy :", sortBy);
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  /* Pagianation */
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  console.log(
    `GET All Restaurants' Pagianation (page, limit, startIndex, endIndex) = (${page}, ${limit}, ${startIndex}, ${endIndex})`
  );

  try {
    const total = await Restaurant.countDocuments();
    query = query.skip(startIndex).limit(limit);

    /* Execute query */
    const restaurants = await query;

    /* Pagianation result */
    const pagianation = {};
    if (endIndex < total) {
      pagianation.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      pagianation.prev = {
        page: page - 1,
        limit: limit,
      };
    }

    console.log(`200 getRestaurants`);
    res.status(200).json({
      succuss: true,
      count: restaurants.length,
      pagianation,
      data: restaurants,
    });
  } catch (err) {
    console.log(`err.stack: ${err.stack}`);
    res.status(400).json({ succuss: false });
  }
};

/*
 * @desc     GET a restaurant
 * @routes   GET /api/v1/restaurants/:id
 * @access   Public
 */
exports.getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      console.log(`400 getRestaurant (null)`);
      return res.status(400).json({ succuss: false });
    } else {
      console.log(`200 getRestaurant`);
      res.status(200).json({ succuss: true, data: restaurant });
    }
  } catch (err) {
    console.log(`err.stack: ${err.stack}`);
    res.status(400).json({ succuss: false });
  }
};

/*
 * @desc     Create a new restaurant
 * @routes   POST /api/v1/restaurants
 * @access   Private
 */
exports.createRestaurant = async (req, res, next) => {
  const restaurant = await Restaurant.create(req.body);
  console.log(`201 createRestaurant`);
  res.status(201).json({ succuss: true, data: restaurant });
};

/*
 * @desc     Update restaurant
 * @routes   PUT /api/v1/restaurant/:id
 * @access   Private
 */
exports.updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!restaurant) {
      console.log(`400 updateRestaurant (null)`);
      return res.status(400).json({ succuss: false });
    } else {
      console.log(`200 updateRestaurant`);
      res.status(200).json({ succuss: true, data: restaurant });
    }
  } catch (err) {
    console.log(`err.stack: ${err.stack}`);
    res.status(400).json({ succuss: false });
  }
};

/*
 * @desc     Delete restaurant
 * @routes   DELETE /api/v1/restaurant/:id
 * @access   Private
 */
exports.deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      console.log(`400 deleteRestaurant (null)`);
      return res.status(400).json({ succuss: false });
    } else {
      restaurant.remove();
      console.log(`200 removeRestaurant`);
      res.status(200).json({ succuss: true, data: {} });
    }
  } catch (err) {
    console.log(`err.stack: ${err.stack}`);
    res.status(400).json({ succuss: false });
  }
};
