import React, { useState } from 'react';
import '../../App.css';

const Admin = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'User 1', email: 'user1@example.com' },
    { id: 2, name: 'User 2', email: 'user2@example.com' },
    { id: 3, name: 'User 3', email: 'user3@example.com' },
  ]);

  const [newUser, setNewUser] = useState({ name: '', email: '' });

  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUser.name && newUser.email) {
      setUsers([...users, { id: users.length + 1, ...newUser }]);
      setNewUser({ name: '', email: '' });
    }
  };

  return (
    <div className="joinContainer">
      <h1>Admin Panel</h1>
      <h2>User Management</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name} - {user.email}</li>
        ))}
      </ul>
      <form onSubmit={handleAddUser}>
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <button type="submit">Add User</button>
      </form>
    </div>
  );
};

export default Admin;
