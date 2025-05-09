const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

// @route   GET api/posts/user
// @desc    Get all posts for the current user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .populate('author', 'username');
    res.json(posts);
  } catch (err) {
    console.error('Error fetching user posts:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content } = req.body;

      const newPost = new Post({
        title,
        content,
        author: req.user.id,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tags: [],
        status: 'published'
      });

      const post = await newPost.save();
      await post.populate('author', 'username');
      res.json(post);
    } catch (err) {
      console.error('Error creating post:', err);
      res.status(500).json({ message: err.message || 'Server Error' });
    }
  }
);

// @route   GET api/posts
// @desc    Get all public posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .populate('author', 'username');
    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET api/posts/:id
// @desc    Get post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username'
        }
      });
      
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error('Error fetching post:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    post.title = title;
    post.content = content;
    post.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    await post.save();
    res.json(post);
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await post.remove();
    res.json({ message: 'Post removed' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
