import React from 'react';
import '../../App.css';

const Home = () => {
  const navigateTo = (page) => {
    window.dispatchEvent(new CustomEvent('navigateTo', { detail: { page } }));
  };

  return (
    <div className="joinContainer">
      <h1>Welcome to AI Chatbot</h1>
      <p>Select an option to get started</p>
      <form>
        <button type="button" onClick={() => navigateTo('chat')}>Chat UI</button>
        <button type="button" onClick={() => navigateTo('sentence-completion')}>Sentence Completions</button>
        <button type="button" onClick={() => navigateTo('model-selection')}>Select Model</button>
        <button type="button" onClick={() => navigateTo('settings')}>Settings</button>
      </form>
    </div>
  );
};

export default Home;
