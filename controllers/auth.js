const User = require("../models/User");

/*
 * @desc     Resigter user
 * @route    POST /api/v1/auth/register
 * @access   Public
 */
exports.register = async (req, res, next) => {
	try {
		console.log(`req.body: ${req.body}`);
		const { name, tel, email, password, role } = req.body;

		/* Create user */
		const user = await User.create({ name, tel, email, password, role });
		sendTokenResponse(user, 200, res);
	} catch (err) {
		console.log(`err.stack: ${err.stack}`);
		res.status(400).json({ success: false, data: err.message });
	}
};

/*
 * @desc     Login user
 * @route    POST /api/v1/auth/login
 * @access   Public
 */
exports.login = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		/* Validate email and password */
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				msg: "Please provide an email and password",
			});
		}

		/* Check for user */
		const user = await User.findOne({ email }).select("+password");
		if (!user) {
			return res
				.status(404)
				.json({ success: false, msg: "Invalid credentials" });
		}

		/*Check if password matches */
		const isMatch = await user.matchPassword(password);
		if (!isMatch) {
			return res.status(401).json({
				success: false,
				msg: "Invalid credentials",
			});
		}
		sendTokenResponse(user, 200, res);
	} catch (err) {
		console.log(`err.stack: ${err.stack}`);
		return res.status(401).json({
			success: false,
			msg: "Cannot convert email or password to string",
		});
	}
};

/* Get token from model1, create cookie and send response */
const sendTokenResponse = (user, statusCode, res) => {
	/* Create token */
	const token = user.getSignedJwtToken();

	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};

	if (process.env.NODE_ENV === "production") {
		options.secure = true;
	}

	res.status(statusCode)
		.cookie("token", token, options)
		.json({ success: true, token });
};

/*
 * @desc     Get current Logged in user
 * @route    GET /api/v1/auth/me
 * @access   Private
 */
exports.getMe = async (req, res, next) => {
	const user = await User.findById(req.user.id);

	res.status(200).json({ success: true, data: user });
};

/*
 * @desc     Log user out, Clear Cookie
 * @route    GET /api/v1/auth/logout
 * @access   Private
 */
exports.logout = async (req, res, next) => {
	/* set cookie token to 'none', then response success = 'true'*/
	res.cookie("token", "none", {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true,
	});

	res.status(200).json({ success: true, data: {} });
};
