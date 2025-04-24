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

## 🛠 Setup

### Install Dependencies

bash
cd backend
npm install

### Run Development Server

bash
npm run dev

### Environment Variables (`.env`)

Make sure to include:
env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

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