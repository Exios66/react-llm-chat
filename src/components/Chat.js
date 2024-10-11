import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import io from 'socket.io-client';
import queryString from 'query-string';
import DOMPurify from 'dompurify';
import Message from './Message';
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
  const ENDPOINT = 'http://localhost:5000';
  
  const location = useLocation();
  const history = useHistory();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);

    socket = io(ENDPOINT);

    setRoom(room);
    setName(name);

    socket.emit('join', { name, room }, (error) => {
      if(error) {
        setError(error);
        history.push('/');
      }
    });

    return () => {
      socket.disconnect();
      socket.off();
    }
  }, [ENDPOINT, location.search, history]);
  
  useEffect(() => {
    socket.on('message', message => {
      setMessages(messages => [ ...messages, message ]);
    });
    
    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });

    socket.on('previousMessages', (prevMessages) => {
      setMessages(prevMessages);
    });

  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (event) => {
    event.preventDefault();

    if(message) {
      socket.emit('sendMessage', DOMPurify.sanitize(message), () => setMessage(''));
    }
  }

  const handleLLMSelection = (llm) => {
    setSelectedLLMs(prev => 
      prev.includes(llm) ? prev.filter(l => l !== llm) : [...prev, llm]
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="outerContainer">
      <div className="container">
        <header className="room-header">
          <h1>Room: {room}</h1>
          <button onClick={() => history.push('/rooms')}>Leave Room</button>
        </header>
        <div className="llm-selection">
          <p>Select LLMs:</p>
          {['OpenAI', 'Claude', 'OpenRouter'].map(llm => (
            <label key={llm}>
              <input
                type="checkbox"
                checked={selectedLLMs.includes(llm)}
                onChange={() => handleLLMSelection(llm)}
              />
              {llm}
            </label>
          ))}
        </div>
        <div className="messages">
          {messages.map((message, i) => 
            <Message 
              key={message.id || i} 
              message={message} 
              name={name}
              isLLM={['OpenAI', 'Claude', 'OpenRouter'].includes(message.user)}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
        <form className="form" onSubmit={sendMessage}>
          <input
            className="input"
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <button className="sendButton" type="submit">Send</button>
        </form>
      </div>
      <div className="usersContainer">
        <h2>Users in Room:</h2>
        {users.length > 0 ? (
          <ul>
            {users.map(user => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>
        ) : <p>No users in room</p>}
      </div>
    </div>
  );
}

export default Chat;
