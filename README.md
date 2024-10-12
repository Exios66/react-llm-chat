# Real-Time Chat Application

This is a real-time chat application built with React, Node.js, Express, and Socket.IO. It features user authentication, room-based chat, and integration with language models.

## Features

- User authentication using JWT
- Create and join chat rooms
- Real-time messaging
- Message history
- Integration with language models (OpenAI, Claude, OpenRouter)
- Dark mode support
- Responsive design

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or later)
- npm (v6 or later)
- MongoDB
- Python (v3.x)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/real-time-chat-app.git
   cd real-time-chat-app
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

4. Install Python dependencies:
   ```
   pip install semver
   ```

5. Set up the pre-commit hook:
   ```
   chmod +x .git/hooks/pre-commit
   ```

6. Create a `.env` file in the backend directory with the following content:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

7. Create a `.env` file in the frontend directory with the following content:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

## Running the Application

1. Start the backend server:
   ```
   cd backend
   npm start
   ```

2. In a new terminal, start the frontend development server:
   ```
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Testing

To run the tests for the frontend:

```
cd frontend
npm test
```

To run the tests for the backend:

```
cd backend
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

Before committing your changes, make sure you have set up the pre-commit hook as described in the installation steps. This hook will automatically update the CHANGELOG.md file with your changes.

## License

This project is licensed under the MIT License.
