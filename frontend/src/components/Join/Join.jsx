import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { TextField, Button, Typography, Container, Box, CircularProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { setUser } from '../../redux/actions/userActions';
import useErrorHandler from '../../hooks/useErrorHandler';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
}));

const Join = () => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const { error, handleError } = useErrorHandler();

  const validateInput = (input, type) => {
    if (input.length < 3) {
      return `${type} must be at least 3 characters long`;
    }
    if (input.length > 20) {
      return `${type} must not exceed 20 characters`;
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameError = validateInput(name, 'Username');
    const roomError = validateInput(room, 'Room name');
    
    if (nameError || roomError) {
      handleError(new Error(nameError || roomError));
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/join`, { name, room });
      dispatch(setUser({ name, id: response.data.userId }));
      history.push(`/chat/${response.data.roomId}?name=${encodeURIComponent(name)}`);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Join Chat
        </Typography>
        <form onSubmit={handleSubmit} className={classes.form}>
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!error}
            disabled={isLoading}
            inputProps={{
              'aria-label': 'Username',
              'aria-required': 'true',
              minLength: 3,
              maxLength: 20,
            }}
          />
          <TextField
            fullWidth
            label="Room Name"
            variant="outlined"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            error={!!error}
            disabled={isLoading}
            inputProps={{
              'aria-label': 'Room Name',
              'aria-required': 'true',
              minLength: 3,
              maxLength: 20,
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.submitButton}
            disabled={isLoading}
            aria-label="Join Chat"
          >
            {isLoading ? <CircularProgress size={24} /> : 'Join Chat'}
          </Button>
        </form>
        {error && (
          <Typography color="error" align="center" style={{ marginTop: '1rem' }}>
            {error.message}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default Join;
