import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import DOMPurify from 'dompurify';
import { debounce } from 'lodash';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  CircularProgress,
  Snackbar,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import Message from './Message';
import useErrorHandler from '../../hooks/useErrorHandler';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    height: '100vh',
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: theme.spacing(2),
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginRight: theme.spacing(2),
  },
  usersContainer: {
    width: '200px',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
  },
}));

let socket;

const Chat = () => {
  const classes = useStyles();
  const { roomId } = useParams();
  const history = useHistory();
  const user = useSelector(state => state.user);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedLLMs, setSelectedLLMs] = useState(['OpenAI', 'Claude', 'OpenRouter']);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ENDPOINT = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const messagesEndRef = useRef(null);
  const { error, handleError } = useErrorHandler();

  const handleMessageChange = useCallback(
    debounce((value) => setMessage(value), 300),
    []
  );

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`${ENDPOINT}/api/chat/messages/${roomId}?page=${page}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages((prevMessages) => [...prevMessages, ...data.messages]);
      setHasMore(data.hasMore);
      setIsLoading(false);
    } catch (err) {
      handleError(err);
    }
  }, [roomId, page, ENDPOINT, handleError]);

  useEffect(() => {
    if (!user.id) {
      history.push('/join');
      return;
    }

    socket = io(ENDPOINT, {
      query: { userId: user.id, roomId }
    });

    socket.emit('join', { name: user.name, room: roomId }, (error) => {
      if (error) {
        handleError(error);
        history.push('/');
      }
    });

    return () => {
      socket.emit('disconnect');
      socket.off();
    };
  }, [ENDPOINT, user, roomId, history, handleError]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const handleMessage = (message) => {
      setMessages((msgs) => [message, ...msgs]);
    };

    const handleRoomData = ({ users }) => {
      setUsers(users);
    };

    socket.on('message', handleMessage);
    socket.on('roomData', handleRoomData);
    socket.on('error', handleError);

    return () => {
      socket.off('message', handleMessage);
      socket.off('roomData', handleRoomData);
      socket.off('error', handleError);
    };
  }, [handleError]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback((event) => {
    event.preventDefault();

    if (message.trim()) {
      const sanitizedMessage = DOMPurify.sanitize(message);
      socket.emit('sendMessage', { name: user.name, room: roomId, message: sanitizedMessage }, (error) => {
        if (error) {
          handleError(error);
        } else {
          setMessage('');
        }
      });
    }
  }, [message, user.name, roomId, handleError]);

  const handleLLMSelection = useCallback((llm) => {
    setSelectedLLMs((prev) =>
      prev.includes(llm) ? prev.filter((l) => l !== llm) : [...prev, llm]
    );
  }, []);

  const loadMoreMessages = useCallback(() => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [hasMore]);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Container className={classes.root}>
      <Paper className={classes.chatContainer} elevation={3}>
        <Typography variant="h4" gutterBottom>
          Room: {roomId}
        </Typography>
        <FormGroup row>
          {['OpenAI', 'Claude', 'OpenRouter'].map((llm) => (
            <FormControlLabel
              key={llm}
              control={
                <Checkbox
                  checked={selectedLLMs.includes(llm)}
                  onChange={() => handleLLMSelection(llm)}
                />
              }
              label={llm}
            />
          ))}
        </FormGroup>
        <List className={classes.messagesContainer}>
          {messages.map((msg, i) => (
            <ListItem key={msg.id || i}>
              <Message
                message={msg}
                name={user.name}
                isLLM={selectedLLMs.includes(msg.user)}
              />
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
        {hasMore && (
          <Button onClick={loadMoreMessages} variant="outlined" fullWidth>
            Load More Messages
          </Button>
        )}
        <form onSubmit={sendMessage} className={classes.inputContainer}>
          <TextField
            className={classes.input}
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            placeholder="Type a message..."
            variant="outlined"
            size="small"
          />
          <Button type="submit" variant="contained" color="primary">
            Send
          </Button>
        </form>
      </Paper>
      <Paper className={classes.usersContainer}>
        <Typography variant="h6" gutterBottom>
          Users in Room
        </Typography>
        <List>
          {users.map((user) => (
            <ListItem key={user.id}>
              <Typography>{user.name}</Typography>
            </ListItem>
          ))}
        </List>
      </Paper>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => handleError(null)}
        message={error}
      />
    </Container>
  );
};

export default Chat;
