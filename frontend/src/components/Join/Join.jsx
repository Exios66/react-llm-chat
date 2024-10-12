import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { TextField, Button, Typography, Container, Box, CircularProgress, Tabs, Tab } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { registerUser, loginUser } from '../../redux/actions/authActions';
import useErrorHandler from '../../hooks/useErrorHandler';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const { error, handleError } = useErrorHandler();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const validateInput = () => {
    if (!email || !password) {
      handleError(new Error('Email and password are required'));
      return false;
    }
    if (tabValue === 0 && !name) {
      handleError(new Error('Name is required for registration'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInput()) return;

    setIsLoading(true);
    try {
      if (tabValue === 0) {
        await dispatch(registerUser({ name, email, password }));
      } else {
        await dispatch(loginUser({ email, password }));
      }
      history.push('/rooms');
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
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Register" />
          <Tab label="Login" />
        </Tabs>
        <form onSubmit={handleSubmit} className={classes.form}>
          {tabValue === 0 && (
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          )}
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <TextField
            fullWidth
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.submitButton}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : (tabValue === 0 ? 'Register' : 'Login')}
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
