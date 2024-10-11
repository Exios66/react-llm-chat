import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider } from './contexts/AuthContext';
import { setUser, clearUser } from './redux/actions/userActions';
import { setRooms, addRoom, removeRoom } from './redux/actions/roomActions';
import { setDarkMode } from './redux/actions/themeActions';
import { fetchRooms } from './services/roomService';
import { checkAuthStatus } from './services/authService';
import { initializeSocket } from './services/socketService';
import { FRONTEND_EVENTS } from './constants/socketEvents';
import { lightTheme, darkTheme } from './themes';
import Join from './components/Join/Join';
import Chat from './components/Chat/Chat';
import RoomList from './components/RoomList/RoomList';
import NotFound from './components/NotFound/NotFound';
import LandingPage from './components/LandingPage/LandingPage';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import './styles/App.css';

function App() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const rooms = useSelector(state => state.rooms);
  const darkMode = useSelector(state => state.theme.darkMode);
  const [loading, setLoading] = useState(true);

  console.log('App component rendered'); // Debug: Log when App component renders

  const theme = useMemo(() => {
    console.log('Theme updated:', darkMode ? 'dark' : 'light'); // Debug: Log theme changes
    return darkMode ? darkTheme : lightTheme;
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    console.log('Toggling dark mode'); // Debug: Log when dark mode is toggled
    dispatch(setDarkMode(!darkMode));
  }, [darkMode, dispatch]);

  useEffect(() => {
    const initializeApp = async () => {
      console.log('Initializing app'); // Debug: Log when app initialization starts
      try {
        const authStatus = await checkAuthStatus();
        console.log('Auth status:', authStatus); // Debug: Log auth status
        if (authStatus.isAuthenticated) {
          console.log('User authenticated:', authStatus.user); // Debug: Log authenticated user
          dispatch(setUser(authStatus.user));
          const fetchedRooms = await fetchRooms();
          console.log('Fetched rooms:', fetchedRooms); // Debug: Log fetched rooms
          dispatch(setRooms(fetchedRooms));
          const socket = initializeSocket(authStatus.token);
          console.log('Socket initialized'); // Debug: Log when socket is initialized
          socket.on(FRONTEND_EVENTS.ROOM_CREATED, (room) => {
            console.log('Room created:', room); // Debug: Log when a room is created
            dispatch(addRoom(room));
          });
          socket.on(FRONTEND_EVENTS.ROOM_DELETED, (roomId) => {
            console.log('Room deleted:', roomId); // Debug: Log when a room is deleted
            dispatch(removeRoom(roomId));
          });
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        dispatch(clearUser());
      } finally {
        console.log('App initialization complete'); // Debug: Log when app initialization is complete
        setLoading(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
          <AuthProvider>
            <SocketProvider>
              <Router>
                <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
                  <Header user={user} toggleDarkMode={toggleDarkMode} />
                  <main className="main-content">
                    <Switch>
                      <Route exact path="/" component={LandingPage} />
                      <Route 
                        path="/join" 
                        render={(props) => <Join {...props} setUser={(user) => dispatch(setUser(user))} />} 
                      />
                      <PrivateRoute 
                        path="/rooms" 
                        component={RoomList}
                        user={user}
                        rooms={rooms}
                      />
                      <PrivateRoute 
                        path="/chat/:roomId" 
                        component={Chat}
                        user={user}
                      />
                      <Route component={NotFound} />
                    </Switch>
                  </main>
                  <Footer />
                </div>
              </Router>
            </SocketProvider>
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
