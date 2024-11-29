# EduVault - Learning Management System

EduVault is a comprehensive Learning Management System (LMS) built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It provides a platform for managing courses, students, and instructors with different role-based access levels.

## 🚀 Features

- **User Authentication & Authorization**
  - Role-based access control (Admin, Teacher, Student)
  - Secure JWT-based authentication
  - Protected routes and API endpoints

- **Course Management**
  - Create, edit, and delete courses
  - Enroll/unenroll students
  - Course descriptions and details
  - Student progress tracking

- **User Management**
  - User registration and profile management
  - Role assignment by administrators
  - User activity tracking

- **Dashboard Interface**
  - Student Dashboard: View enrolled courses and progress
  - Teacher Dashboard: Manage courses and students
  - Admin Dashboard: System-wide management capabilities

## 🛠️ Prerequisites

Before setting up the project, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager
- Git

## 🔧 Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/eduvault.git
   cd eduvault
   ```

2. **Install Backend Dependencies**
   ```bash
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/eduvault
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

5. **Database Setup**
   - Start MongoDB service on your machine
   - The application will automatically create the required collections

## 🚀 Running the Application

1. **Start the Backend Server**
   ```bash
   npm run server
   ```
   The server will start on http://localhost:5001

2. **Start the Frontend Development Server**
   ```bash
   cd client
   npm start
   ```
   The frontend will start on http://localhost:3000

3. **Running Both Frontend and Backend (Development)**
   ```bash
   npm run dev
   ```

## 👥 User Roles and Access

### Creating Initial Admin Account
1. Register a new account at `/register`
2. Use MongoDB Compass or Shell to manually set the user's role to 'admin':
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

### Role Capabilities

1. **Admin**
   - Manage all users and their roles
   - Create/edit/delete any course
   - Access all system features
   - View system analytics

2. **Teacher**
   - Create and manage their own courses
   - View enrolled students
   - Update course content
   - Track student progress

3. **Student**
   - View and enroll in available courses
   - Track personal progress
   - View course materials
   - Update personal profile

## 🎯 Using the Platform

### For Students
1. Register an account (default role: student)
2. Log in to access the student dashboard
3. Browse available courses
4. Enroll in desired courses
5. Access course materials
6. Track your progress

### For Teachers
1. Register an account
2. Contact admin to get teacher role assigned
3. Create and manage courses
4. Monitor student enrollment and progress
5. Update course materials

### For Administrators
1. Access admin dashboard
2. Manage user roles and permissions
3. Monitor system usage
4. Manage all courses and users

## 🔒 Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- Protected API routes
- Role-based access control
- Input validation and sanitization
- XSS protection
- CORS configuration

## 🛠️ Tech Stack

- **Frontend**
  - React.js
  - React Router
  - Axios
  - Tailwind CSS
  - Context API for state management

- **Backend**
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - JWT for authentication
  - bcrypt for password hashing

## 📝 API Documentation

### Authentication Endpoints
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user

### Course Endpoints
- GET `/api/courses` - Get all courses
- POST `/api/courses` - Create new course
- PUT `/api/courses/:id` - Update course
- DELETE `/api/courses/:id` - Delete course
- POST `/api/courses/:id/enroll` - Enroll in course
- DELETE `/api/courses/:id/unenroll` - Unenroll from course

### User Endpoints
- GET `/api/users` - Get all users (admin only)
- PUT `/api/users/:id/role` - Update user role (admin only)
- DELETE `/api/users/:id` - Delete user (admin only)

## 🤝 Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- MongoDB for the database
- Express.js for the backend framework
- React.js for the frontend library
- Node.js for the runtime environment
- Tailwind CSS for styling

## 📞 Support

For support, email support@eduvault.com or create an issue in the repository.
