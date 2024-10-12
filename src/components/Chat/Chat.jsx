// src/components/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import io from 'socket.io-client';
import queryString from 'query-string';
import DOMPurify from 'dompurify';
import Message from './Message';
import LoadingScreen from './LoadingScreen';
import './Chat.css';

let socket;

const Chat = ({ user }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedLLMs, setSelectedLLMs] = useState(['OpenAI', 'Claude', 'OpenRouter']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const ENDPOINT = 'http://localhost:5000';

  const location = useLocation();
  const history = useHistory();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);

    socket = io(ENDPOINT, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    setName(name);
    setRoom(room);

    socket.emit('join', { name, room }, (error) => {
      if (error) {
        setError(error);
        history.push('/');
      }
    });

    // Cleanup on unmount
    return () => {
      socket.emit('disconnect');
      socket.off();
    };
  }, [ENDPOINT, location.search, history]);

  useEffect(() => {
    const handleMessage = (message) => {
      setMessages((msgs) => [...msgs, message]);
    };

    const handleRoomData = ({ users }) => {
      setUsers(users);
    };

    const handlePreviousMessages = (prevMessages) => {
      setMessages(prevMessages);
      setIsLoading(false);
    };

    socket.on('message', handleMessage);
    socket.on('roomData', handleRoomData);
    socket.on('previousMessages', handlePreviousMessages);
    socket.on('connect_error', (err) => {
      setError('Connection Error. Please try again later.');
      console.error('Socket connection error:', err);
      setIsLoading(false);
    });

    return () => {
      socket.off('message', handleMessage);
      socket.off('roomData', handleRoomData);
      socket.off('previousMessages', handlePreviousMessages);
      socket.off('connect_error');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (event) => {
    event.preventDefault();

    if (message.trim()) {
      const sanitizedMessage = DOMPurify.sanitize(message);
      socket.emit('sendMessage', sanitizedMessage, (acknowledgment) => {
        if (acknowledgment.status === 'ok') {
          setMessage('');
        } else {
          setError('Failed to send message. Please try again.');
        }
      });
    }
  };

  const handleLLMSelection = (llm) => {
    setSelectedLLMs((prev) =>
      prev.includes(llm) ? prev.filter((l) => l !== llm) : [...prev, llm]
    );
  };

  if (error) {
    return (
      <div className="error-container" role="alert">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => history.push('/')}>Go Back</button>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingScreen loadingText="Connecting to chat..." />;
  }

  return (
    <div className="outerContainer">
      <div className="container" aria-live="polite" aria-atomic="true">
        <header className="room-header">
          <h1>Room: {room}</h1>
          <button className="leave-button" onClick={() => history.push('/rooms')}>
            Leave Room
          </button>
        </header>
        <div className="llm-selection" role="group" aria-labelledby="llm-selection-label">
          <p id="llm-selection-label">Select LLMs:</p>
          {['OpenAI', 'Claude', 'OpenRouter'].map((llm) => (
            <label key={llm} className="llm-label">
              <input
                type="checkbox"
                checked={selectedLLMs.includes(llm)}
                onChange={() => handleLLMSelection(llm)}
                aria-checked={selectedLLMs.includes(llm)}
              />
              {llm}
            </label>
          ))}
        </div>
        <div className="messages" role="log" aria-live="polite">
          {messages.map((msg, i) => (
            <Message
              key={msg.id || i}
              message={msg}
              name={name}
              isLLM={selectedLLMs.includes(msg.user)}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form className="form" onSubmit={sendMessage} aria-label="Send Message Form">
          <input
            className="input"
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            aria-label="Message Input"
            required
          />
          <button className="sendButton" type="submit" aria-label="Send Message">
            Send
          </button>
        </form>
      </div>
      <div className="usersContainer" aria-label="Users in Room">
        <h2>Users in Room:</h2>
        {users.length > 0 ? (
          <ul>
            {users.map((user) => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>
        ) : (
          <p>No users in room</p>
        )}
      </div>
    </div>
  );
};

export default Chat;
