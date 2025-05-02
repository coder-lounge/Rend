# Backend - Rend

This directory contains the **Node.js + Express** backend logic for Rend. It is responsible for handling API requests, interacting with the database, managing authentication, processing logic, and coordinating smart contract interactions (if applicable).

## 📁 Structure

backend/
├── ai/             # AI modules for automation, moderation, scoring
├── controllers/    # Route controllers for handling request logic
├── middleware/     # Middleware functions (auth, error handling)
├── model/          # Mongoose models (e.g., User, Content)
├── router/         # Express route definitions
├── tests/          # Backend test files (Jest)
├── .env            # Environment configuration
├── index.js        # Entry point for Express app
├── package.json    # Dependencies and scripts
└── README.md       # This file

## 🔐 Authentication API

### User Registration
- **Endpoint**: POST /api/auth/register
- **Description**: Register a new user account
- **Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: 201 Created
  ```json
  {
    "success": true,
    "token": "JWT_TOKEN",
    "user": {
      "_id": "string",
      "username": "string",
      "email": "string"
    }
  }
  ```

### User Login
- **Endpoint**: POST /api/auth/login
- **Description**: Authenticate a user and get a token
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: 200 OK
  ```json
  {
    "success": true,
    "token": "JWT_TOKEN",
    "user": {
      "_id": "string",
      "username": "string",
      "email": "string"
    }
  }
  ```

### Forgot Password
- **Endpoint**: POST /api/auth/forgot-password
- **Description**: Request a password reset email
- **Body**:
  ```json
  {
    "email": "string"
  }
  ```
- **Response**: 200 OK
  ```json
  {
    "success": true,
    "message": "Password reset email sent if account exists"
  }
  ```

### Reset Password
- **Endpoint**: POST /api/auth/reset-password/:token
- **Description**: Reset password using token received via email
- **Parameters**: token (string) - Reset token received in email
- **Body**:
  ```json
  {
    "password": "string"
  }
  ```
- **Response**: 200 OK
  ```json
  {
    "success": true,
    "message": "Password updated successfully"
  }
  ```

### Get Current User
- **Endpoint**: GET /api/auth/me
- **Description**: Get the currently authenticated user's details
- **Headers**: Authorization: Bearer {token}
- **Response**: 200 OK
  ```json
  {
    "success": true,
    "user": {
      "_id": "string",
      "username": "string",
      "email": "string"
    }
  }
  ```

### Security Features
- Password hashing using bcrypt with salt rounds of 10
- JWT-based authentication with 30-day expiration
- Email verification for password reset
- Secure password reset flow with time-limited tokens
- Input validation and sanitization
- Protection against brute force attacks
- Secure password storage (passwords never returned in responses)

## 🛠 Setup

### Install Dependencies

```bash
cd backend
npm install
```

### Run Development Server

```bash
npm run dev
```

### Environment Variables (`.env`)

Make sure to include:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password
```

## 🚀 Available Scripts

- `npm run dev`: Start server with nodemon (hot reload)
- `npm test`: Run backend tests with Jest
- `npm run lint`: Lint code for style issues (if configured)

## 🧪 Testing

This project uses [Jest](https://jestjs.io/) for backend testing.
bash
npm test

Write your tests in the `/tests` folder following the naming convention `*.test.js`.

## ✨ Notes

- All routes are defined in `/router`
- MongoDB is used with Mongoose ODM
- Uses JSON Web Tokens (JWT) for authentication
- Modularized with controller, model, and middleware layers

For contribution instructions, see [CONTRIBUTING.md](../CONTRIBUTING.md).