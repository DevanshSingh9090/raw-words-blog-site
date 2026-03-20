# Raw Words

A full-stack blog/content management platform built with the **MERN stack**. It supports user authentication, Google login, blog publishing, category management, comments, likes, profile editing, and admin-only dashboards.

## Features

### Authentication
- Register with name, email, and password
- Login with email/password
- Google sign-in using Firebase
- Logout with secure HTTP-only cookie sessions

### Blog system
- Create, edit, delete, and view blogs
- Upload featured images with Cloudinary
- Rich text editor for blog content
- Slug-based blog URLs
- Browse blogs by category
- View related blogs
- Search blogs by title

### Engagement
- Like and unlike blogs
- View like count and whether the current user has liked a post
- Add comments to blogs
- View comment count and full comment history

### User management
- View and update profile
- Update name, email, bio, password, and avatar
- Admin dashboard for viewing all users
- Delete users from admin panel

### Category management
- Add, edit, delete, and list categories
- Automatic slug generation from category name

### Access control
- Protected routes for logged-in users
- Admin-only routes for category and user management
- Role-based authorization on the backend

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Redux Toolkit
- Redux Persist
- React Router DOM
- React Hook Form
- Zod
- CKEditor 5
- Firebase Authentication
- React Toastify
- Radix UI
- Lucide React / React Icons

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- Cloudinary
- Cookie Parser
- CORS
- dotenv

## Project Structure

```bash
api/
  config/
  controllers/
  helpers/
  middleware/
  models/
  routes/
  index.js

client/
  src/
    components/
    helpers/
    hooks/
    Layout/
    pages/
    redux/
    App.jsx
    main.jsx
    store.js
```

## Backend Overview

The backend exposes REST APIs for:
- `/api/auth` — register, login, Google login, logout
- `/api/user` — profile and user admin operations
- `/api/category` — category CRUD
- `/api/blog` — blog CRUD, listing, search, related blogs
- `/api/comment` — comment CRUD and counts
- `/api/blog-like` — like toggle and like counts

It uses:
- MongoDB collections for users, blogs, categories, comments, and likes
- JWT stored in an HTTP-only cookie for authentication
- Cloudinary for image uploads
- Multer for handling file uploads

## Frontend Overview

The frontend includes:
- Home page showing all blogs
- Blog details page with author info, likes, comments, and related blogs
- Category-wise blog listing
- Search results page
- Sign in / sign up pages
- Profile page
- Admin pages for blogs, categories, comments, and users

The app uses:
- Session-persisted Redux state for login data
- Protected routes for authenticated areas
- Admin route guard for management pages
- Reusable UI components from a shadcn-style component set

## Environment Variables

### Backend (`api/.env`)
```env
PORT=5000
MONGODB_CONN=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173

CLOUDINARY_APP_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API=your_firebase_api_key
```

## Installation

### 1) Clone the repository
```bash
git clone <your-repo-url>
cd <project-folder>
```

### 2) Install backend dependencies
```bash
cd api
npm install
```

### 3) Install frontend dependencies
```bash
cd ../client
npm install
```

### 4) Add environment variables
Create the `.env` files in both `api` and `client` folders and fill in the required values.

### 5) Run the backend
```bash
cd api
npm run dev
```

### 6) Run the frontend
```bash
cd client
npm run dev
```

## Available Scripts

### Backend
- `npm run dev` — start backend with nodemon
- `npm start` — production start script

### Frontend
- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

## Deployment Notes

- Frontend is prepared for Vercel deployment
- Backend includes a Vercel config as well
- Make sure CORS `FRONTEND_URL` matches the deployed frontend URL
- Update MongoDB, Cloudinary, Firebase, and JWT environment variables in production

## Notes

- Blog content is stored as encoded HTML and decoded on the client for display.
- Image uploads are validated to allow only common image types.
- The app uses cookie-based auth, so requests from the frontend include credentials.

## License

This project is for educational and portfolio use.
