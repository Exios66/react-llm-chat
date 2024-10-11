import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Join from './components/Join';
import Chat from './components/Chat';
import RoomList from './components/RoomList';
import NotFound from './components/NotFound';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/" render={() => <Redirect to="/join" />} />
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
