const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const verifyToken = require("../middleware/auth");

//update user
router.put("/:id", verifyToken, async(req, res) => {
    console.log(req);
    if (req.userId == req.params.id) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (err) {
                return res.status(500).json(err);
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            res.status(200).json("Account has been updated");
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can update only your account!");
    }
});

//delete user
router.delete("/:id", async(req, res) => {
    if (req.body.userId == req.params.id) {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted");
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can delete only your account!");
    }
});

//get a user
router.get("/:id", async(req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (user) {
            const { password, ...other } = user._doc;
            return res.status(200).json(other);
        } else {
            return res.status(403).json("Dont find");
        }
    } catch (err) {
        return res.status(500).json(err);
    }
});



// //get all user
// router.get("/all", async(req, res) => {
//     try {
//         const user = await User.toArray((err, result)=>  {
//             if (err) throw err;
//             console.log(result);
//           })
//         res.status(200).json(user);
//     } catch (err) {
//         res.status(500).json(err);
//     }
// });

//follow a user
router.put("/:id/follow", verifyToken, async(req, res) => {
    if (req.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.userId);
            if (!user.followers.includes(req.userId)) {
                await user.updateOne({ $push: { followers: req.userId } });
                await currentUser.updateOne({ $push: { followings: req.params.id } });
                res.status(200).json("user has been followed");
            } else {
                res.status(403).json("you allready follow this user");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("you cant follow yourself");
    }
});

//unfollow a user

router.put("/:id/unfollow", verifyToken, async(req, res) => {
    if (req.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.userId);
            if (user.followers.includes(req.userId)) {
                await user.updateOne({ $pull: { followers: req.userId } });
                await currentUser.updateOne({ $pull: { followings: req.params.id } });
                res.status(200).json("user has been unfollowed");
            } else {
                res.status(403).json("you dont follow this user");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("you cant unfollow yourself");
    }
});


//get all user
router.get("/", async(req, res) => {
    try {
        const user = await User.find()
        if (user) {
            // const { password, ...other } = user._doc;
            return res.status(200).json(user);
        } else {
            return res.status(403).json("Dont find");
        }
    } catch (err) {
        return res.status(500).json(err.message);
    }
});




module.exports = router;