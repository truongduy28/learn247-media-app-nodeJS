const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyToken = require('../middleware/auth')

// @route GET api/auth
// @desc Check if user is logged in
// @access Public
router.get('/', verifyToken, async(req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password')
        if (!user)
            return res.status(400).json({ success: false, message: 'User not found' })
        return res.json({ success: true, user })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
    }
})

// REGISTER
// @route POST /api/auth/register
// @access public
router.post("/register", async(req, res) => {
    // case username || password null
    if (!req.body.username || !req.body.password)
        return res
            .status(400)
            .json({ success: false, message: "Username or password required" });
    try {
        // case User already exists
        const checkExists = await User.findOne({ username: req.body.username });
        if (checkExists)
            return res
                .status(400)
                .json({ success: false, message: "User already exists" });

        const checkExisEmail = await User.findOne({ email: req.body.email });
        if (checkExisEmail)
            return res
                .status(400)
                .json({ success: false, message: "Email already exists" });

        //generate new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        //create new user
        const newUser = new User({
            // req.body
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });

        //save user and respond
        const user = await newUser.save();
        // return res.status(200).json(user);

        // Return token
        const accessToken = jwt.sign({ userId: newUser._id },
            process.env.ACCESS_TOKEN_SECRET
        );

        return res.status(200).json({
            success: true,
            message: "User created successfully",
            accessToken,
        });
    } catch (err) {
        return res.status(500).json(err.message);
    }
});

//LOGIN
router.post("/login", async(req, res) => {
    // case username || password null
    if (!req.body.email || !req.body.password)
        return res
            .status(400)
            .json({ success: false, message: "Username or password required" });

    try {
        const user = await User.findOne({ email: req.body.email });
        !user && res.status(404).json("user not found");

        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!validPassword)
            return res.status(400).json("wrong password");

        // return res.status(200).json(user);
        const accessToken = jwt.sign({ userId: user._id },
            process.env.ACCESS_TOKEN_SECRET
        );

        return res.status(200).json({
            success: true,
            message: "login successfully",
            accessToken,
            user
        });
    } catch (err) {
        return res.status(500).json(err);
    }
});
module.exports = router;