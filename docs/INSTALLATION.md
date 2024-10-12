# Installation Guide

This document provides step-by-step instructions for setting up the Chat Application.

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- MongoDB

## Steps

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/chat-application.git
   cd chat-application
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

4. Set up environment variables:
   - In the `backend` directory, create a `.env` file with the following content:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     PORT=5000
     FRONTEND_URL=http://localhost:3000
     ```
   - In the `frontend` directory, create a `.env` file with:
     ```
     REACT_APP_API_URL=http://localhost:5000
     ```

5. Start the backend server:
   ```
   cd backend
   npm start
   ```

6. In a new terminal, start the frontend development server:
   ```
   cd frontend
   npm start
   ```

7. Open your browser and navigate to `http://localhost:3000`

You should now have the Chat Application running locally!
