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
	query = Restaurant.find(JSON.parse(queryStr)).populate("reservations");

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

	/* Pagination */
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 25;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	console.log(
		`GET All Restaurants' Pagination (page, limit, startIndex, endIndex) = (${page}, ${limit}, ${startIndex}, ${endIndex})`
	);

	try {
		const total = await Restaurant.countDocuments();
		query = query.skip(startIndex).limit(limit);

		/* Execute query */
		const restaurants = await query;

		/* Pagination result */
		const pagination = {};
		if (endIndex < total) {
			pagination.next = {
				page: page + 1,
				limit: limit,
			};
		}

		if (startIndex > 0) {
			pagination.prev = {
				page: page - 1,
				limit: limit,
			};
		}

		console.log(`200 getRestaurants`);
		res.status(200).json({
			succuss: true,
			count: restaurants.length,
			pagination,
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
	if (checkValidCreatingRestaurantRecord(req.body)) {
		try {
			const restaurant = await Restaurant.create(req.body);
			console.log(`201 createRestaurant`);
			res.status(201).json({ succuss: true, data: restaurant });
		} catch (err) {
			console.log(`err.stack: ${err.stack}`);
			res.status(400).json({ succuss: false });
		}
	} else {
		res.status(400).json({ succuss: false });
	}
};

/*
 * @desc     Update restaurant
 * @routes   PUT /api/v1/restaurant/:id
 * @access   Private
 */
exports.updateRestaurant = async (req, res, next) => {
	/* If any restaurant wants to update an available time, first, check whether if req.body is on the right format */
	if (req.body.hasOwnProperty("availabletime")) {
		const validation = checkValidCreatingRestaurantRecord(req.body);
		if (!validation) {
			console.log(`400 updateRestaurant (req.body ${validation})`);
			res.status(400).json({ succuss: false });
		}
	}

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

function checkValidCreatingRestaurantRecord(json) {
	/* Check if body has available time as a key */
	if (!json.hasOwnProperty("availabletime")) {
		return false;
	}

	const days = [
		"sunday",
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
	];

	for (let i = 0; i < days.length; i++) {
		/* Then, Check if it has days[i] as a key*/
		if (!json.availabletime.hasOwnProperty(days[i])) {
			return false;
		}

		switch (i) {
			case 0:
				if (!checkValidTime(json.availabletime.sunday)) {
					return false;
				}
				break;
			case 1:
				if (!checkValidTime(json.availabletime.monday)) {
					return false;
				}
				break;
			case 2:
				if (!checkValidTime(json.availabletime.tuesday)) {
					return false;
				}
				break;
			case 3:
				if (!checkValidTime(json.availabletime.wednesday)) {
					return false;
				}
				break;
			case 4:
				if (!checkValidTime(json.availabletime.thursday)) {
					return false;
				}
				break;
			case 5:
				if (!checkValidTime(json.availabletime.friday)) {
					return false;
				}
				break;
			case 6:
				if (!checkValidTime(json.availabletime.saturday)) {
					return false;
				}
				break;
		}
	}

	return true;
}

function checkValidTime(dayArray) {
	/**
	 * ISO_8601 = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i
	 * 2016-05-24T15:54:14.876Z   true
	 * 2002-12-31T23:00:00+01:00  true
	 * 2016-02-01                 false
	 * 2016                       false
	 */

	/* EX. 11:00:00.000*/
	let timeFormat = /^\d\d:\d\d:\d\d$/i;

	/* An Array must have length of 0 (for not open on that day) or 2 (which contains open and close time)*/
	if (!(dayArray.length === 2 || dayArray.length === 0)) {
		return false;
	}

	let openTimeArray = [];
	let closeTimeArray = [];

	/*  Use REGEX for checking time format*/
	for (let i = 0; i < dayArray.length; i++) {
		if (!timeFormat.test(dayArray[i])) {
			return false;
		}

		openTimeArray = i === 0 ? dayArray[0].split(":") : openTimeArray;
		closeTimeArray = i === 1 ? dayArray[1].split(":") : closeTimeArray;
	}

	/* TODO DELETE THE COMMENTED CODE BELOW AFTER DONE ON CHECKING */
	// console.log(
	//   openTimeArray,
	//   closeTimeArray,
	//   openTimeArray[0] > closeTimeArray[0],
	//   openTimeArray[0] >= "00" && openTimeArray[0] <= "24",
	//   closeTimeArray[0] >= "00" && closeTimeArray[0] <= "24"
	// );

	/* Check whether if open time is greater than close time */
	if (openTimeArray[0] > closeTimeArray[0]) {
		return false;
	} else if (
		openTimeArray[0] === closeTimeArray[0] &&
		openTimeArray[1] > closeTimeArray[1]
	) {
		return false;
	} else if (
		openTimeArray[0] === closeTimeArray[0] &&
		openTimeArray[1] === closeTimeArray[1] &&
		openTimeArray[2] >= closeTimeArray[2]
	) {
		return false;
	}

	/* Check whether if open and close time is in acceptance range */
	if (
		!(openTimeArray.length === 0 && closeTimeArray.length === 0) &&
		!(
			openTimeArray[0] >= "00" &&
			openTimeArray[0] <= "24" &&
			closeTimeArray[0] >= "00" &&
			closeTimeArray[0] <= "24"
		)
	) {
		return false;
	}
	return true;
}
