// ErrorBoundary.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './ErrorBoundary.css'; // Ensure to import the CSS

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    this.setState({ error, errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    console.error("Uncaught error:", error, errorInfo);
  }

  handleRetry() {
    // Reset the error state and retry rendering the children
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  }

  render() {
    if (this.state.hasError) {
      const {
        fallbackUI,
        title = "Oops! Something went wrong.",
        message = "We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.",
        showDetails = process.env.NODE_ENV === 'development',
        showRetry = false,
        retryText = "Retry",
      } = this.props;

      if (fallbackUI) {
        return fallbackUI;
      }

      return (
        <div className="error-boundary" role="alert" aria-live="assertive">
          <h1 className="error-title">{title}</h1>
          <p className="error-message">{message}</p>
          {showRetry && (
            <button className="retry-button" onClick={this.handleRetry}>
              {retryText}
            </button>
          )}
          {showDetails && this.state.error && this.state.errorInfo && (
            <details className="error-details" style={{ whiteSpace: 'pre-wrap' }}>
              <summary>View Details</summary>
              {this.state.error.toString()}
              <br />
              {this.state.errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }

    return this.props.children; 
  }
}

// PropTypes for type checking
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallbackUI: PropTypes.element, // Custom fallback UI
  title: PropTypes.string,
  message: PropTypes.string,
  onError: PropTypes.func, // Function to handle error logging
  onRetry: PropTypes.func, // Function to handle retry action
  showDetails: PropTypes.bool,
  showRetry: PropTypes.bool,
  retryText: PropTypes.string,
};

export default ErrorBoundary;
