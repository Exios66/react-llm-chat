import React, { useState } from 'react';
import '../../App.css';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    // In a real application, you would dispatch an action to update the global state
    // and possibly save the preference to local storage or a backend
  };

  const handleNotificationsToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // In a real application, you would update the notification settings
  };

  return (
    <div className="joinContainer">
      <h1>Settings</h1>
      <form>
        <div>
          <label>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={handleDarkModeToggle}
            />
            Dark Mode
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={handleNotificationsToggle}
            />
            Enable Notifications
          </label>
        </div>
        {/* Add more settings as needed */}
      </form>
    </div>
  );
};

export default Settings;
