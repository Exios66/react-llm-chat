import React, { useState, useEffect, useCallback } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setRooms, addRoom, updateRoom, removeRoom } from '../../redux/actions/roomActions';
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
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import useErrorHandler from '../../hooks/useErrorHandler';
import io from 'socket.io-client';

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

const RoomList = React.memo(({ user }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const rooms = useSelector(state => state.rooms);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { error, handleError } = useErrorHandler();
  const ENDPOINT = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const fetchRooms = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${ENDPOINT}/api/rooms?page=${pageNum}`);
      dispatch(setRooms(response.data.rooms));
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      handleError(err);
      setLoading(false);
    }
  }, [dispatch, ENDPOINT, handleError]);

  useEffect(() => {
    fetchRooms();

    const socket = io(ENDPOINT);

    socket.on('roomCreated', (room) => {
      dispatch(addRoom(room));
    });

    socket.on('roomUpdated', (room) => {
      dispatch(updateRoom(room));
    });

    socket.on('roomDeleted', (roomId) => {
      dispatch(removeRoom(roomId));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, ENDPOINT, fetchRooms]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRooms(page);
    setRefreshing(false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchRooms(value);
  };

  if (loading) return <CircularProgress />;

  return (
    <ErrorBoundary>
      <Container maxWidth="md" className={classes.root}>
        <Typography variant="h4" component="h1" gutterBottom>
          Available Rooms
        </Typography>
        {rooms.length === 0 ? (
          <Typography>No rooms available. Why not create one?</Typography>
        ) : (
          <List className={classes.list} aria-label="room list">
            {rooms.map((room) => (
              <ListItem
                button
                key={room.id}
                component={Link}
                to={`/chat/${room.id}?name=${encodeURIComponent(user.name)}`}
              >
                <ListItemText
                  primary={room.name}
                  secondary={`${room.userCount} users`}
                />
              </ListItem>
            ))}
          </List>
        )}
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
        <Box className={classes.actions}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => history.push('/join')}
          >
            Create New Room
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Rooms'}
          </Button>
        </Box>
      </Container>
      {error && (
        <Typography color="error" align="center">
          {error}
        </Typography>
      )}
    </ErrorBoundary>
  );
});

export default RoomList;
