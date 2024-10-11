import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setRooms } from '../redux/actions/roomActions';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import './RoomList.css';
console.log('RoomList CSS imported'); // Debug log

const RoomList = ({ user }) => {
  const dispatch = useDispatch();
  const rooms = useSelector(state => state.rooms);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRooms = useCallback(async () => {
    try {
      console.log('Fetching rooms...'); // Debug log
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/rooms`);
      console.log('Rooms fetched:', response.data); // Debug log
      dispatch(setRooms(response.data));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching rooms:', err); // Debug log
      setError('Failed to fetch rooms. Please try again later.');
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleRefresh = () => {
    setLoading(true);
    setError('');
    fetchRooms();
  };

  if (loading) return <LoadingSpinner message="Loading rooms..." />;
  if (error) return <ErrorMessage message={error} onRetry={handleRefresh} />;

  return (
    <div className="roomListContainer">
      <h1>Available Rooms</h1>
      {rooms.length === 0 ? (
        <p>No rooms available. Why not create one?</p>
      ) : (
        <ul className="roomList">
          {rooms.map((room) => (
            <li key={room.id} className="roomItem">
              <Link to={`/chat/${room.id}?name=${encodeURIComponent(user.name)}`}>
                {room.name}
                <span className="roomUserCount">({room.userCount} users)</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="roomListActions">
        <Link to="/join" className="button createRoomButton">Create New Room</Link>
        <button onClick={handleRefresh} className="button refreshButton">Refresh Rooms</button>
      </div>
    </div>
  );
};

export default RoomList;
