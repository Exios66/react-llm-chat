import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../Button/Button';
import './Join.css';

const Join = ({ setUser, history }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name) {
      setUser({ name });
      history.push('/rooms');
    }
  };

  return (
    <div className="join-container">
      <header className="join-header">
        <h1>Join Chat</h1>
      </header>
      <main className="join-main">
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Enter username..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <Button text="Join Chat" type="submit" />
        </form>
      </main>
    </div>
  );
};

export default Join;
