const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const jwt = require('jsonwebtoken')
const verifyToken = require('../middleware/auth')


//create a post
router.post("/", verifyToken, async(req, res) => {
    const newPost = new Post({
            userId: req.userId,
            desc: req.body.desc,
            img: req.body.img,
            category: req.body.category
        })
        // newPost.populate('userId')
    try {
        const savedPost = await newPost.save()
        res.status(200).json(savedPost);
    } catch (err) {
        res.status(500).json(err.message);
    }
});


//update a post
router.put("/:id", verifyToken, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId == req.userId) {
            await post.updateOne({ $set: req.body });
            return res.status(200).json(post);
        } else {
            return res.status(403).json("you can update only your post");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//delete a post
router.delete("/:id", verifyToken, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId == req.userId) {
            await post.deleteOne();
            return res.status(200).json("the post has been deleted");
        } else {
            return res.status(403).json("you can delete only your post");
        }
    } catch (err) {
        return res.status(500).json(err.message);
    }
});

//like / dislike a post
router.put("/:id/like", verifyToken, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.userId)) {
            await post.updateOne({ $push: { likes: req.userId } });
            return res.status(200).json(post);
        } else {
            await post.updateOne({ $pull: { likes: req.userId } });
            return res.status(200).json("The post has been disliked");
        }
    } catch (err) {
        return res.status(500).json(err);
    }
});

//get a post
router.get("/:id", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('userId', ['username', 'profilePicture', 'isAdmin']);
        return res.status(200).json(post);
    } catch (err) {
        return res.status(500).json(err.message);
    }
});

//get timeline posts
router.get("/timeline/all", async(req, res) => {



    try {
        const currentUser = await User.findById(req.body.userId);
        const userPosts = await Post.find({ userId: currentUser._id });
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({ userId: friendId });
            })
        );
        res.json(userPosts.concat(...friendPosts))
    } catch (err) {
        res.status(500).json(err.message);
    }
});


// get all posts
router.get("/", async(req, res) => {
    const { q, gte, lt } = req.query;

    // Fetch Document By Specific Date (findDate is Parameter)
    const search = (data) => {
        return data.filter((item) => item.desc.toLowerCase().includes(q));
    };

    try {
        if (gte && lt) {
            const startDate = new Date(new Date(gte).setUTCHours(0, 0, 0, 0)).toISOString()
            const endDate = new Date(new Date(lt).setUTCHours(23, 59, 59, 999)).toISOString()
            const posts = await Post.find({
                createdAt: {
                    $gte: startDate,
                    $lt: endDate
                }
            }).sort({ createdAt: -1 }).populate('userId', ['username', 'profilePicture', 'isAdmin'])
            if (q)
                return res.json(search(posts))
            else return res.json(posts);
        } else {
            const posts = await Post.find().sort({ createdAt: -1 }).populate('userId', ['username', 'profilePicture', 'isAdmin']);
            if (q)
                return res.json(search(posts))
            else return res.json(posts);
        }
    } catch (err) {
        return res.status(500).json(err.message);
    }
});

// get post of user
router.get("/user/:userId", async(req, res) => {
    try {
        const posts = await Post.find({ userId: req.params.userId }).sort({ createdAt: -1 }).populate('userId', ['username', 'profilePicture', 'isAdmin']);
        return res.status(200).json(posts)
    } catch (err) {
        return res.status(500).json(err.message);
    }
});

module.exports = router;