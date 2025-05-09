# Personal Blog

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) blog application with user authentication, markdown editor, and comment system.

## Features

- User authentication (register, login, logout)
- Admin dashboard for managing posts
- Markdown editor for creating and editing posts
- Public blog listing with pagination
- Comment system
- Responsive design using Material-UI

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd personal-blog
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
```

4. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/personal-blog
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

5. Start the development servers:

In the root directory:
```bash
npm run dev
```

In the client directory:
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/user - Get current user

### Posts
- GET /api/posts - Get all published posts
- GET /api/posts/:id - Get a single post
- POST /api/posts - Create a new post
- PUT /api/posts/:id - Update a post
- DELETE /api/posts/:id - Delete a post

### Comments
- GET /api/comments/post/:postId - Get comments for a post
- POST /api/comments/:postId - Add a comment
- DELETE /api/comments/:id - Delete a comment

## Technologies Used

- Frontend:
  - React.js
  - Material-UI
  - React Router
  - Axios

- Backend:
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - JWT Authentication

## License

MIT 