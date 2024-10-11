import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';
import Join from './components/Join/Join';
import Chat from './components/Chat/Chat';
import RoomList from './components/RoomList/RoomList';
import NotFound from './components/NotFound/NotFound';
import LandingPage from './components/LandingPage/LandingPage';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Fetch rooms from backend
    const fetchRooms = async () => {
      try {
        const response = await axios.get('/api/rooms');
        setRooms(response.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    // Apply dark mode
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Router>
      <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
        <Header user={user} toggleDarkMode={toggleDarkMode} />
        <main className="main-content">
          <Switch>
            <Route exact path="/" component={LandingPage} />
            <Route 
              path="/join" 
              render={(props) => <Join {...props} setUser={setUser} />} 
            />
            <Route 
              path="/rooms" 
              render={(props) => 
                user ? <RoomList {...props} user={user} rooms={rooms} /> : <Redirect to="/join" />
              } 
            />
            <Route 
              path="/chat/:roomId" 
              render={(props) => 
                user ? <Chat {...props} user={user} /> : <Redirect to="/join" />
              } 
            />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
