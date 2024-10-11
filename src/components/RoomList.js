import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './RoomList.css';

const RoomList = ({ user }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/rooms');
        setRooms(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch rooms');
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) return <div>Loading rooms...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="roomListContainer">
      <h1>Available Rooms</h1>
      {rooms.length === 0 ? (
        <p>No rooms available. Why not create one?</p>
      ) : (
        <ul className="roomList">
          {rooms.map((room) => (
            <li key={room} className="roomItem">
              <Link to={`/chat?name=${user.name}&room=${room}`}>{room}</Link>
            </li>
          ))}
        </ul>
      )}
      <Link to="/join" className="button">Create New Room</Link>
    </div>
  );
};

export default RoomList;
