import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Join from './components/Join/Join';
import Chat from './components/Chat/Chat';
import RoomList from './components/RoomList/RoomList';
import NotFound from './components/NotFound/NotFound';
import LandingPage from './components/LandingPage/LandingPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/" component={LandingPage} />
          <Route 
            path="/join" 
            render={(props) => <Join {...props} setUser={setUser} />} 
          />
          <Route 
            path="/rooms" 
            render={(props) => 
              user ? <RoomList {...props} user={user} /> : <Redirect to="/join" />
            } 
          />
          <Route 
            path="/chat" 
            render={(props) => 
              user ? <Chat {...props} user={user} /> : <Redirect to="/join" />
            } 
          />
          <Route component={NotFound} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
