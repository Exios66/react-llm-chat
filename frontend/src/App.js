import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './redux/actions/authActions';
import axios from 'axios';
import './App.css';

import Home from './components/Home/Home';
import Chat from './components/Chat/Chat';
import SentenceCompletion from './components/SentenceCompletion/SentenceCompletion';
import ModelSelection from './components/ModelSelection/ModelSelection';
import Settings from './components/Settings/Settings';
import Admin from './components/Admin/Admin';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector(state => state.user);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    const handleNavigation = (event) => {
      setCurrentPage(event.detail.page);
    };

    window.addEventListener('navigateTo', handleNavigation);

    return () => {
      window.removeEventListener('navigateTo', handleNavigation);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/data`);
        // Handle the response
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'chat':
        return <Chat />;
      case 'sentence-completion':
        return <SentenceCompletion />;
      case 'model-selection':
        return <ModelSelection />;
      case 'settings':
        return <Settings />;
      case 'admin':
        return <Admin />;
      default:
        return <Home />;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <header>
        AI Chatbot Interface
        <button className="dark-mode-toggle" onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>
      <main>
        {renderContent()}
      </main>
      <footer>
        <button onClick={() => setCurrentPage('home')}>Home</button>
        <button onClick={() => setCurrentPage('chat')}>Chat</button>
        <button onClick={() => setCurrentPage('model-selection')}>Models</button>
        <button onClick={() => setCurrentPage('settings')}>Settings</button>
        {isAuthenticated && <button onClick={() => setCurrentPage('admin')}>Admin</button>}
      </footer>
    </div>
  );
}

export default App;
