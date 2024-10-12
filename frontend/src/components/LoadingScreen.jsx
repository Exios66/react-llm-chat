// LoadingScreen.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './LoadingScreen.css'; // Ensure to import the CSS

const LoadingScreen = ({
  isLoading = true,
  loadingText = 'Loading...',
  spinnerSize = '50px',
  backgroundColor = 'rgba(0, 0, 0, 0.5)',
  textColor = '#fff',
}) => {
  if (!isLoading) return null;

  return (
    <div
      className="loading-screen"
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{ backgroundColor }}
    >
      <div className="spinner" style={{ width: spinnerSize, height: spinnerSize }}></div>
      <p className="loading-text" style={{ color: textColor }}>
        {loadingText}
      </p>
    </div>
  );
};

// PropTypes for type checking
LoadingScreen.propTypes = {
  isLoading: PropTypes.bool,
  loadingText: PropTypes.string,
  spinnerSize: PropTypes.string,
  backgroundColor: PropTypes.string,
  textColor: PropTypes.string,
};

export default LoadingScreen;
