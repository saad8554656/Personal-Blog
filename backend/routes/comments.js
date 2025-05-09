const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @route   POST api/comments/:postId
// @desc    Add a comment to a post
// @access  Private
router.post('/:postId', [
    auth,
    [
        check('content', 'Content is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        const newComment = new Comment({
            content: req.body.content,
            post: req.params.postId,
            author: req.user.id
        });

        const comment = await newComment.save();
        await comment.populate('author', 'username');
        
        // Add comment to post's comments array
        post.comments.push(comment._id);
        await post.save();
        
        res.json(comment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/comments/post/:postId
// @desc    Get all comments for a post
// @access  Public
router.get('/post/:postId', async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .populate('author', 'username')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        
        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        // Check user
        if (comment.author.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await comment.remove();
        res.json({ msg: 'Comment removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Comment not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router; 