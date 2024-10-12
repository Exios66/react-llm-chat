import React, { useState, useEffect, useRef } from 'react';
import '../../App.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() === '') return;

    const newMessage = { text: inputMessage, own: true };
    setMessages([...messages, newMessage]);
    setInputMessage('');
    setTyping(true);

    // Simulate AI response (replace with actual API call in production)
    setTimeout(() => {
      const aiResponse = { 
        text: "This is a simulated AI response. In a real application, this would be replaced with an actual API call to the selected AI model.", 
        own: false 
      };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
      setTyping(false);
    }, 1000);
  };

  return (
    <div className="chatContainer">
      <div className="chatHeader">
        <h2>Chat UI</h2>
      </div>
      <div className="chatMessages" ref={chatMessagesRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.own ? 'own' : ''}`}>
            {message.text}
          </div>
        ))}
        {typing && <div className="typing">AI is typing...</div>}
      </div>
      <form className="chatForm" onSubmit={sendMessage}>
        <input 
          type="text" 
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
