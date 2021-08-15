/*eslint-disable*/
const router = require("express").Router();
const Post = require("../models/Post")
const User = require("../models/User")
    //create a post
router.post("/", async(req, res) => {
        const newPost = new Post(req.body)
        try {
            const savedPost = await newPost.save()
            res.status(200).json(savedPost)
        } catch (err) {
            res.status(500).json("err")
        }
    })
    //update a post
router.put("/:id", async(req, res) => {
        try {
            console.log(req.params.id)
            const post = await Post.findById(req.params.id)
            console.log(post.userId)
            if (post.userId === req.body.userId) {
                await post.updateOne({ $set: req.body })
                res.status(200).json("the post has been updated");
            } else {
                res.status(403).json("you can update only your post")
            }
        } catch (err) {
            res.status(500).json("err")
        }
    })
    //delete a Post
router.delete("/:id", async(req, res) => {
        try {
            console.log(req.params.id)
            const post = await Post.findById(req.params.id)
            console.log(post.userId)
            if (post.userId === req.body.userId) {
                await post.deleteOne()
                res.status(200).json("the post has been deleted");
            } else {
                res.status(403).json("you can delete only your post")
            }
        } catch (err) {
            res.status(500).json("err")
        }
    })
    //like/dislike a Post
router.put("/:id/like", async(req, res) => {
        try {
            const post = await Post.findById(req.params.id)
            if (!post.likes.includes(req.body.userId)) {
                await post.updateOne({ $push: { likes: req.body.userId } })
                res.status(200).json("The post has been liked");
            } else {
                await post.updateOne({ $pull: { likes: req.body.userId } })
                res.status(200).json("The post has been disliked")
            }
        } catch (err) {
            res.status(500).json(err)
        }

    })
    //get a Post
router.get("/:id", async(req, res) => {

    try {
        const post = await Post.findById(req.params.id)
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err)

    }
})

//get user's all posts
router.get("/profile/:username", async(req, res) => {
    try {
        // console.log("Test Point: ", User.findById(req.body.userId))
        const user = User.findOne({ username: req.params.username })
        const posts = Post.find({ userId: user._id })
        res.status(200).json(posts)
    } catch (err) {
        res.status(500).json(err)
    }
})


//get timeline posts
router.get("/timeline/:userId", async(req, res) => {
    try {
        // console.log("Test Point: ", User.findById(req.body.userId))
        const currentUser = await User.findById(req.params.userId)
        console.log("Test Point 2");
        console.log(currentUser);
        const userPosts = await Post.find({ userId: currentUser._id })
        const friendPosts = await Promise.all(
            currentUser.following.map((friendId) => {
                return Post.find({ userId: friendId })
            })
        )
        res.status(200).json(userPosts.concat(...friendPosts))
    } catch (err) {
        res.status(500).json(err)
    }
})

module.exports = router