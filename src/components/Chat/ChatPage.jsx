// src/components/ChatPage.jsx
import React from 'react';
import Chat from './Chat';
import ErrorBoundary from './ErrorBoundary';
import LoadingScreen from './LoadingScreen';
import './ChatPage.css'; // Optional: Additional styles for the ChatPage

const ChatPage = ({ user }) => {
  return (
    <ErrorBoundary
      title="Chat Error"
      message="An unexpected error occurred in the chat. Please refresh the page or contact support."
      showRetry={true}
      onRetry={() => window.location.reload()}
      retryText="Reload Chat"
    >
      <Chat user={user} />
    </ErrorBoundary>
  );
};

export default ChatPage;
