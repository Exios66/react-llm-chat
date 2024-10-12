import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import { loadUser } from './redux/actions/authActions';
import Join from './components/Join/Join';
import Chat from './components/Chat/Chat';
import RoomList from './components/RoomList/RoomList';
import NotFound from './components/NotFound/NotFound';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector(state => state.user);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <SnackbarProvider maxSnack={3}>
      <Router>
        <div className="App">
          <Switch>
            <Route exact path="/" render={() => (
              isAuthenticated ? <Redirect to="/rooms" /> : <Redirect to="/join" />
            )} />
            <Route path="/join" render={() => (
              isAuthenticated ? <Redirect to="/rooms" /> : <Join />
            )} />
            <Route path="/rooms" render={() => (
              isAuthenticated ? <RoomList /> : <Redirect to="/join" />
            )} />
            <Route path="/chat/:roomId" render={() => (
              isAuthenticated ? <Chat /> : <Redirect to="/join" />
            )} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </Router>
    </SnackbarProvider>
  );
}

export default App;
