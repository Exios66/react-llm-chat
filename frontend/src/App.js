import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider } from './contexts/AuthContext';
import { setUser, clearUser } from './redux/actions/userActions';
import { setRooms, addRoom, removeRoom } from './redux/actions/roomActions';
import { toggleDarkMode } from './redux/actions/themeActions';
import { fetchRooms } from './services/roomService';
import { checkAuthStatus } from './services/authService';
import { initializeSocket } from './services/socketService';
import { FRONTEND_EVENTS } from './constants/socketEvents';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import useErrorHandler from './hooks/useErrorHandler';
import './App.css';

// Lazy load components
const Join = lazy(() => import('./components/Join/Join'));
const Chat = lazy(() => import('./components/Chat/Chat'));
const RoomList = lazy(() => import('./components/RoomList/RoomList'));
const NotFound = lazy(() => import('./components/NotFound/NotFound'));
const LandingPage = lazy(() => import('./components/LandingPage/LandingPage'));

function App() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const rooms = useSelector(state => state.rooms);
  const darkMode = useSelector(state => state.theme.darkMode);
  const [loading, setLoading] = useState(true);
  const { error, handleError } = useErrorHandler();

  const handleToggleDarkMode = useCallback(() => {
    dispatch(toggleDarkMode());
  }, [dispatch]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        const authStatus = await checkAuthStatus();
        if (authStatus.isAuthenticated) {
          console.log('User authenticated:', authStatus.user);
          dispatch(setUser(authStatus.user));
          const fetchedRooms = await fetchRooms();
          console.log('Fetched rooms:', fetchedRooms);
          dispatch(setRooms(fetchedRooms));
          const socket = initializeSocket(authStatus.token);
          socket.on(FRONTEND_EVENTS.ROOM_CREATED, (room) => {
            console.log('Room created:', room);
            dispatch(addRoom(room));
          });
          socket.on(FRONTEND_EVENTS.ROOM_DELETED, (roomId) => {
            console.log('Room deleted:', roomId);
            dispatch(removeRoom(roomId));
          });
        } else {
          console.log('User not authenticated');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        handleError(error);
        dispatch(clearUser());
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [dispatch, handleError]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <SocketProvider>
            <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
              <Header user={user} toggleDarkMode={handleToggleDarkMode} />
              <main className="main-content">
                <Suspense fallback={<LoadingSpinner />}>
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
                </Suspense>
              </main>
              <Footer />
            </div>
          </SocketProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ErrorBoundary>
  );
}

export default React.memo(App);
