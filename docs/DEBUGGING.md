# Debugging Guide

This document provides instructions on how to debug various parts of the Chat Application.

## Frontend Debugging

### Using React Developer Tools

1. Install the React Developer Tools extension for your browser.
2. Open your browser's developer tools (usually F12 or right-click and select "Inspect").
3. Navigate to the "Components" tab to inspect React components and their props/state.

### Redux Debugging

1. Install the Redux DevTools extension for your browser.
2. Open your browser's developer tools.
3. Navigate to the "Redux" tab to inspect the state and action history.

### Console Logging

- Use `console.log()`, `console.error()`, or `console.warn()` to output debugging information to the browser console.
- In the Chat component, you can find existing debug logs that can be uncommented for additional information.

### Error Boundary

The application uses an ErrorBoundary component to catch and display runtime errors. Check the ErrorBoundary component if you're seeing unexpected error screens.

## Backend Debugging

### Using Node.js Debugger

1. Start the backend with the debugging flag:
   ```
   node --inspect backend/server.js
   ```
2. Open Chrome and navigate to `chrome://inspect`
3. Click on "Open dedicated DevTools for Node"

### Logging

- The application uses a custom logger. You can find it in `backend/utils/logger.js`.
- Use `logger.info()`, `logger.error()`, or `logger.warn()` for logging in the backend.
- Check the console where you started the backend server for these logs.

### Database Debugging

1. Use MongoDB Compass to connect to your database and inspect the data directly.
2. In your backend code, you can use `console.log(yourMongooseQuery.explain())` to see how MongoDB is executing your queries.

## Socket.IO Debugging

1. Enable Socket.IO debugging by setting the `DEBUG` environment variable:
   ```
   DEBUG=socket.io* npm start
   ```
2. This will output detailed Socket.IO logs to the console.

## Common Issues and Solutions

1. **Issue**: Frontend can't connect to backend
   **Solution**: Ensure the `REACT_APP_API_URL` in the frontend `.env` file matches your backend URL and port.

2. **Issue**: Authentication errors
   **Solution**: Check that the `JWT_SECRET` in the backend `.env` file is set and matches the one used to sign the tokens.

3. **Issue**: Database connection errors
   **Solution**: Verify that the `MONGODB_URI` in the backend `.env` file is correct and that your MongoDB instance is running.

4. **Issue**: "Module not found" errors
   **Solution**: Run `npm install` in both frontend and backend directories to ensure all dependencies are installed.

Remember to remove any sensitive information or extra logging before deploying to production.
