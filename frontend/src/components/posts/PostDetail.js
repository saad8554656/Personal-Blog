import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import MDEditor from '@uiw/react-md-editor';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';

const PostDetail = () => {
  const [post, setPost] = useState({
    title: '',
    content: '',
    author: { username: '' },
    createdAt: '',
    comments: []
  });
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/api/posts/${id}`);
        setPost({
          ...res.data,
          comments: res.data.comments || []
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err.response?.data?.message || 'Error fetching post');
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required. Please log in again.');
          return;
        }

        await api.delete(`/api/posts/${id}`);
        navigate('/dashboard');
      } catch (err) {
        console.error('Error deleting post:', err);
        if (err.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (err.response?.status === 403) {
          setError('You are not authorized to delete this post.');
        } else if (err.response?.status === 404) {
          setError('Post not found.');
        } else {
          setError(err.response?.data?.message || 'Error deleting post. Please try again.');
        }
      }
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/api/comments/${id}`, { content: comment });
      setPost(prevPost => ({
        ...prevPost,
        comments: [...(prevPost.comments || []), res.data]
      }));
      setComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
      setError(err.response?.data?.message || 'Error posting comment');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">Post not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {post.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          By {post.author?.username} on{' '}
          {new Date(post.createdAt).toLocaleDateString()}
        </Typography>
        <Box mt={3}>
          <MDEditor.Markdown source={post.content} />
        </Box>
        {user && user._id === post.author?._id && (
          <Box mt={3} display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/edit-post/${id}`)}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Box>
        )}
        <Divider sx={{ my: 4 }} />
        <Typography variant="h5" gutterBottom>
          Comments
        </Typography>
        {user ? (
          <Box component="form" onSubmit={handleComment} mb={4}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Add a comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Post Comment
            </Button>
          </Box>
        ) : (
          <Alert severity="info" sx={{ mb: 4 }}>
            Please log in to leave a comment
          </Alert>
        )}
        <List>
          {(post.comments || []).map((comment) => (
            <ListItem key={comment._id} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar>{comment.author?.username?.[0]?.toUpperCase()}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={comment.author?.username}
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1">{comment.content}</Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default PostDetail; 