import React, { useState, useEffect, useCallback } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
  Container,
  Box,
  CircularProgress,
  Pagination,
  TextField,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import useErrorHandler from '../../hooks/useErrorHandler';
import { logoutUser } from '../../redux/actions/authActions';
import { setRooms, addRoom } from '../../redux/actions/roomActions';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
  list: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
  },
}));

const RoomList = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const rooms = useSelector(state => state.rooms);
  const token = useSelector(state => state.user.token);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newRoomName, setNewRoomName] = useState('');
  const { error, handleError } = useErrorHandler();

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/chat/rooms?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch(setRooms(response.data.rooms));
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      handleError(err);
      setLoading(false);
    }
  }, [dispatch, page, token, handleError]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/chat/rooms`, 
        { name: newRoomName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(addRoom(response.data));
      setNewRoomName('');
    } catch (err) {
      handleError(err);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    history.push('/join');
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <ErrorBoundary>
      <Container maxWidth="md" className={classes.root}>
        <Typography variant="h4" component="h1" gutterBottom>
          Available Rooms
        </Typography>
        <Button onClick={handleLogout} variant="outlined" color="secondary">
          Logout
        </Button>
        <List className={classes.list} aria-label="room list">
          {rooms.map((room) => (
            <ListItem
              button
              key={room.id}
              component={Link}
              to={`/chat/${room.id}`}
            >
              <ListItemText
                primary={room.name}
                secondary={`${room.userCount || 0} users`}
              />
            </ListItem>
          ))}
        </List>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
        <Box className={classes.actions}>
          <form onSubmit={handleCreateRoom}>
            <TextField
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="New room name"
              variant="outlined"
              size="small"
            />
            <Button type="submit" variant="contained" color="primary">
              Create New Room
            </Button>
          </form>
        </Box>
      </Container>
      {error && (
        <Typography color="error" align="center">
          {error}
        </Typography>
      )}
    </ErrorBoundary>
  );
};

export default RoomList;
