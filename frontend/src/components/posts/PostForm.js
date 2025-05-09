import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import MDEditor from '@uiw/react-md-editor';
import axios from 'axios';

const PostForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchPost = async () => {
      if (id) {
        try {
          const config = {
            headers: {
              'x-auth-token': localStorage.getItem('token'),
            },
          };
          const res = await axios.get(`/api/posts/${id}`, config);
          setFormData({
            title: res.data.title,
            content: res.data.content,
          });
        } catch (err) {
          setError('Error fetching post');
        }
      }
    };

    fetchPost();
  }, [id]);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const config = {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      };

      console.log('Creating post with data:', formData);
      if (id) {
        await axios.put(`/api/posts/${id}`, formData, config);
      } else {
        const response = await axios.post('/api/posts', formData, config);
        console.log('Post creation response:', response.data);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating post:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);
      setError(err.response?.data?.message || 'Error saving post');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {id ? 'Edit Post' : 'Create Post'}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={onSubmit}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={onChange}
            required
            margin="normal"
          />
          <Box mt={2} mb={2}>
            <Typography variant="subtitle1" gutterBottom>
              Content
            </Typography>
            <MDEditor
              value={formData.content}
              onChange={(value) =>
                setFormData({ ...formData, content: value || '' })
              }
              preview="edit"
              height={400}
            />
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : id ? (
              'Update Post'
            ) : (
              'Create Post'
            )}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default PostForm; 