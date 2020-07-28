const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const User = require("../../models/user");
const Profile = require("../../models/profile");
const Post = require("../../models/post");

// @route /api/posts
// @desc posts
// @access public

router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();

      res.json({ post });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route /api/posts
// @desc  get all posts
// @access private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route /api/posts/:id
// @desc  get posts by Id
// @access private

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post Not found" });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "Post Not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route /api/posts/:id
// @desc  delete posts by Id
// @access private

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post Not found" });
    }

    // Check user

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await post.remove();
    res.send("Post deleted");
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "Post Not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route /api/profile/like/:id
// @desc  like by posts
// @access private

router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (
      post.likes.filter((like) => like.user.toString() == req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post has already been liked" });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "Post Not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route /api/profile/unlike/:id
// @desc  unlike posts
// @access private

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (
      post.likes.filter((like) => like.user.toString() == req.user.id).length ==
      0
    ) {
      return res.status(400).json({ msg: "Post has not yet been liked" });
    }

    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    await post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "Post Not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route /api/posts/comments/:id
// @desc posts comment for the post
// @access public

router.post(
  "/comments/:id",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json({ post });
    } catch (err) {
      console.error(err.message);
      if (err.kind == "ObjectId") {
        return res.status(404).json({ msg: "Not a valid id" });
      }
      res.status(500).send("Server Error");
    }
  }
);

// @route /api/posts/comments/:id/:comments_id
// @desc delete comment for the post
// @access public

router.delete("/comments/:id/:comment_id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const post = await Post.findById(req.params.id);

    //pull out comments

    const comment = await post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exceed" });
    }

    //Check User

    if (comment.user.toString() !== req.user.id) {
      return res.status(400).json({ map: "User not authorized" });
    }

    const removeIndex = await post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post);
  } catch (err) {
    console.err(err.message);
    if (err.kind == "objectId") {
      return res.status(404).json({ msg: "Not a valid id" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
